import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dir, "..")
const templates = path.join(root, "templates", "agents")
const manifest = await Bun.file(path.join(root, ".codex-plugin", "plugin.json")).json() as { version?: string }
if (!manifest.version) throw new Error("plugin manifest is missing a version")
const pluginVersion = manifest.version
const markerName = ".newtype-codex-agents.json"
const requiredAgentFields = ["name", "description", "developer_instructions"]

const args = Bun.argv.slice(2)
const dry = args.includes("--dry-run")
const force = args.includes("--force")
const global = args.includes("--global")
const inherit = args.includes("--inherit-model")
const status = args.includes("--status")
const detect = !args.includes("--no-detect-models")
const list = args.includes("--list-models")
const projectIndex = args.indexOf("--project")
const project = projectIndex >= 0 ? args[projectIndex + 1] : process.cwd()
const target = global ? path.join(os.homedir(), ".codex", "agents") : path.join(project, ".codex", "agents")
const stale = ["newtype_workbench.toml"]

const env = {
  "__CHIEF_MODEL__": process.env.newtype_codex_chief_model,
  "__STRONG_MODEL__": process.env.newtype_codex_strong_model,
  "__FAST_MODEL__": process.env.newtype_codex_fast_model,
}

const fallback = {
  "__CHIEF_MODEL__": "gpt-5.5",
  "__STRONG_MODEL__": "gpt-5.4",
  "__FAST_MODEL__": "gpt-5.4-mini",
}

const utility = /(mini|spark|fast|lite|nano)/i

function usage() {
  console.log(`Usage: bun plugins/newtype-codex/scripts/install-agents.ts [--global] [--project <dir>] [--dry-run] [--force] [--inherit-model]

Options:
  --status            Check whether all agents match the plugin version and supported schema
  --list-models       Print Codex model slugs from "codex debug models" and exit
  --no-detect-models  Skip Codex model catalog detection and use fallback models
  --inherit-model     Omit model fields so custom agents inherit the parent Codex session model

Default model strategy:
  Visible gpt-* models are sorted by numeric version. Chief and specialist agents
  use the highest general model; utility agents use the highest mini/spark/fast model.

Environment overrides:
  newtype_codex_chief_model   preferred Chief model
  newtype_codex_strong_model  preferred specialist model
  newtype_codex_fast_model    preferred utility model`)
}

if (args.includes("--help") || args.includes("-h")) {
  usage()
  process.exit(0)
}

if (projectIndex >= 0 && !project) {
  console.error("Missing value for --project")
  process.exit(1)
}

const files = (await Array.fromAsync(new Bun.Glob("*.toml").scan({ cwd: templates }))).sort()

function agentFileProblems(text: string) {
  const problems = requiredAgentFields
    .filter((field) => !new RegExp(`^${field}\\s*=`, "m").test(text))
    .map((field) => `missing ${field}`)

  if (/^display_name\s*=/m.test(text)) {
    problems.push("unsupported display_name")
  }

  return problems
}

if (status) {
  const missing = files.filter((file) => !existsSync(path.join(target, file)))
  if (missing.length > 0) {
    console.error(`newtype agents missing: ${missing.join(", ")}`)
    process.exit(2)
  }

  for (const file of files) {
    const problems = agentFileProblems(await Bun.file(path.join(target, file)).text())
    if (problems.length > 0) {
      console.error(`newtype agents need refresh: invalid ${file} (${problems.join(", ")})`)
      process.exit(2)
    }
  }

  const markerPath = path.join(target, markerName)
  if (!existsSync(markerPath)) {
    console.error("newtype agents need refresh: version marker missing")
    process.exit(2)
  }

  try {
    const installed = await Bun.file(markerPath).json() as { pluginVersion?: string }
    if (installed.pluginVersion !== pluginVersion) {
      console.error(`newtype agents need refresh: installed=${installed.pluginVersion ?? "unknown"}, plugin=${pluginVersion}`)
      process.exit(2)
    }
  } catch (error) {
    console.error(`newtype agents need refresh: invalid version marker (${String(error)})`)
    process.exit(2)
  }

  console.log(`newtype agents are current for plugin ${pluginVersion}`)
  process.exit(0)
}

async function catalog() {
  if (!detect && !list) return []
  if (process.env.newtype_codex_models_json) {
    return slugs(JSON.parse(process.env.newtype_codex_models_json) as Catalog)
  }

  const proc = Bun.spawn(["codex", "debug", "models"], {
    stdout: "pipe",
    stderr: "ignore",
  })
  const text = await new Response(proc.stdout).text()
  const status = await proc.exited
  if (status !== 0) return []

  const start = text.indexOf("{")
  if (start < 0) return []

  return slugs(JSON.parse(text.slice(start)) as Catalog)
}

type Catalog = {
  models?: Array<{ slug?: string; visibility?: string }>
}

function slugs(data: Catalog) {
  return (data.models ?? [])
    .filter((model) => model.slug && model.visibility !== "hide")
    .map((model) => model.slug!)
}

const available = await catalog()
const gpt = available.filter((model) => /^gpt-\d/.test(model)).sort(rank)
const general = gpt.filter((model) => !utility.test(model))
const quick = gpt.filter((model) => utility.test(model))

if (list) {
  for (const model of available) console.log(model)
  process.exit(0)
}

function version(model: string) {
  return /^gpt-(\d+(?:\.\d+)*)/.exec(model)?.[1].split(".").map(Number) ?? []
}

function score(model: string) {
  if (utility.test(model)) return 0
  if (model.includes("codex")) return 2
  return 1
}

function rank(a: string, b: string) {
  const left = version(a)
  const right = version(b)
  const size = Math.max(left.length, right.length)
  for (const index of Array.from({ length: size }, (_, value) => value)) {
    const diff = (right[index] ?? 0) - (left[index] ?? 0)
    if (diff !== 0) return diff
  }
  const diff = score(b) - score(a)
  if (diff !== 0) return diff
  return a.localeCompare(b)
}

function pick(key: keyof typeof fallback) {
  if (env[key]) return env[key]
  if (!detect || gpt.length === 0) return fallback[key]
  if (key === "__FAST_MODEL__") return quick[0] ?? general[0] ?? fallback[key]
  return general[0] ?? gpt[0] ?? fallback[key]
}

const models = {
  "__CHIEF_MODEL__": pick("__CHIEF_MODEL__"),
  "__STRONG_MODEL__": pick("__STRONG_MODEL__"),
  "__FAST_MODEL__": pick("__FAST_MODEL__"),
}

if (!inherit) {
  console.log(`models: chief=${models.__CHIEF_MODEL__}, strong=${models.__STRONG_MODEL__}, fast=${models.__FAST_MODEL__}`)
}

await Bun.$`mkdir -p ${target}`

for (const file of stale) {
  const out = path.join(target, file)
  if (!existsSync(out)) continue
  if (dry) {
    console.log(`remove ${out}`)
    continue
  }
  await rm(out)
  console.log(`removed ${out}`)
}

let skipped = false

for (const file of files) {
  const out = path.join(target, file)
  const src = await Bun.file(path.join(templates, file)).text()
  const text = inherit
    ? src.replace(/^model = "__[A-Z_]+__"\n/gm, "")
    : Object.entries(models).reduce((value, entry) => value.replaceAll(entry[0], entry[1]), src)

  if (existsSync(out) && !force) {
    skipped = true
    console.log(`skip ${out} (exists; use --force to overwrite)`)
    continue
  }

  if (dry) {
    console.log(`write ${out}`)
    continue
  }

  await Bun.write(out, text)
  console.log(`wrote ${out}`)
}

const markerPath = path.join(target, markerName)
if (skipped) {
  console.log(`skip ${markerPath} (agent files were not refreshed; use --force)`)
} else {
  const marker = JSON.stringify({
    plugin: "newtype-codex",
    pluginVersion,
    modelStrategy: inherit ? "inherit" : "pinned",
    agents: files,
  }, null, 2) + "\n"
  if (dry) {
    console.log(`write ${markerPath}`)
  } else {
    await Bun.write(markerPath, marker)
    console.log(`wrote ${markerPath}`)
  }
}

console.log(global ? "installed global newtype Codex agents" : `installed project newtype Codex agents in ${target}`)
if (inherit) console.log("model fields omitted; agents inherit the parent Codex session model")
