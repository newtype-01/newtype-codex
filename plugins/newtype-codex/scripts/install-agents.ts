import { existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dir, "..")
const templates = path.join(root, "templates", "agents")

const args = Bun.argv.slice(2)
const dry = args.includes("--dry-run")
const force = args.includes("--force")
const global = args.includes("--global")
const inherit = args.includes("--inherit-model")
const detect = !args.includes("--no-detect-models")
const list = args.includes("--list-models")
const projectIndex = args.indexOf("--project")
const project = projectIndex >= 0 ? args[projectIndex + 1] : process.cwd()
const target = global ? path.join(os.homedir(), ".codex", "agents") : path.join(project, ".codex", "agents")

const candidates = {
  "__CHIEF_MODEL__": [
    process.env.NEWTYPE_CODEX_CHIEF_MODEL,
    "gpt-5.5",
    "gpt-5.4",
    "gpt-5.3-codex",
    "gpt-5.2",
  ],
  "__STRONG_MODEL__": [
    process.env.NEWTYPE_CODEX_STRONG_MODEL,
    "gpt-5.4",
    "gpt-5.5",
    "gpt-5.3-codex",
    "gpt-5.2",
  ],
  "__FAST_MODEL__": [
    process.env.NEWTYPE_CODEX_FAST_MODEL,
    "gpt-5.4-mini",
    "gpt-5.3-codex-spark",
    "gpt-5.4",
    "gpt-5.2",
  ],
}

function usage() {
  console.log(`Usage: bun plugins/newtype-codex/scripts/install-agents.ts [--global] [--project <dir>] [--dry-run] [--force] [--inherit-model]

Options:
  --list-models       Print Codex model slugs from "codex debug models" and exit
  --no-detect-models  Skip Codex model catalog detection and use the first fallback candidate
  --inherit-model     Omit model fields so custom agents inherit the parent Codex session model

Environment overrides:
  NEWTYPE_CODEX_CHIEF_MODEL   preferred Chief model
  NEWTYPE_CODEX_STRONG_MODEL  preferred specialist model
  NEWTYPE_CODEX_FAST_MODEL    preferred utility model`)
}

if (args.includes("--help") || args.includes("-h")) {
  usage()
  process.exit(0)
}

if (projectIndex >= 0 && !project) {
  console.error("Missing value for --project")
  process.exit(1)
}

async function catalog() {
  if (!detect && !list) return []

  const proc = Bun.spawn(["codex", "debug", "models"], {
    stdout: "pipe",
    stderr: "ignore",
  })
  const text = await new Response(proc.stdout).text()
  const status = await proc.exited
  if (status !== 0) return []

  const start = text.indexOf("{")
  if (start < 0) return []

  const data = JSON.parse(text.slice(start)) as {
    models?: Array<{ slug?: string; visibility?: string }>
  }
  return (data.models ?? [])
    .filter((model) => model.slug && model.visibility !== "hide")
    .map((model) => model.slug!)
}

const available = await catalog()

if (list) {
  for (const model of available) console.log(model)
  process.exit(0)
}

function pick(key: keyof typeof candidates) {
  const values = candidates[key].filter((value): value is string => !!value)
  if (!detect || available.length === 0) return values[0]
  return values.find((value) => available.includes(value)) ?? values[0]
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

const files = (await Array.fromAsync(new Bun.Glob("*.toml").scan({ cwd: templates }))).sort()

for (const file of files) {
  const out = path.join(target, file)
  const src = await Bun.file(path.join(templates, file)).text()
  const text = inherit
    ? src.replace(/^model = "__[A-Z_]+__"\n/gm, "")
    : Object.entries(models).reduce((value, entry) => value.replaceAll(entry[0], entry[1]), src)

  if (existsSync(out) && !force) {
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

console.log(global ? "installed global Newtype Codex agents" : `installed project Newtype Codex agents in ${target}`)
if (inherit) console.log("model fields omitted; agents inherit the parent Codex session model")
