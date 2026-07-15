import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import path from "node:path"

const repo = path.resolve(import.meta.dir, "..", "..", "..")
const plugin = path.join(repo, "plugins", "newtype-codex")
const expectedSkills = ["newtype-chief"]
const expectedAgents = [
  "newtype_archivist.toml",
  "newtype_chief.toml",
  "newtype_deputy.toml",
  "newtype_editor.toml",
  "newtype_extractor.toml",
  "newtype_fact_checker.toml",
  "newtype_researcher.toml",
  "newtype_writer.toml",
]

async function json(file: string) {
  const value = JSON.parse(await Bun.file(file).text())
  console.log(`json ok ${path.relative(repo, file)}`)
  return value
}

function exists(file: string) {
  if (!existsSync(file)) throw new Error(`missing ${path.relative(repo, file)}`)
  console.log(`exists ${path.relative(repo, file)}`)
}

async function skill(file: string) {
  const text = await Bun.file(file).text()
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatter) {
    throw new Error(`invalid skill frontmatter: ${path.relative(repo, file)}`)
  }
  const parsed = Bun.YAML.parse(frontmatter[1]) as { name?: unknown; description?: unknown }
  if (typeof parsed.name !== "string" || typeof parsed.description !== "string") {
    throw new Error(`skill frontmatter needs string name and description: ${path.relative(repo, file)}`)
  }
  console.log(`skill ok ${path.relative(repo, file)}`)
}

async function toml(file: string) {
  const text = await Bun.file(file).text()
  for (const field of ["name", "description", "developer_instructions"]) {
    if (!new RegExp(`^${field}\\s*=`, "m").test(text)) {
      throw new Error(`missing ${field}: ${path.relative(repo, file)}`)
    }
  }
  if (/^display_name\s*=/m.test(text)) {
    throw new Error(`unsupported display_name in custom agent: ${path.relative(repo, file)}`)
  }
  console.log(`agent ok ${path.relative(repo, file)}`)
}

async function metadata(file: string) {
  const text = await Bun.file(file).text()
  Bun.YAML.parse(text)
  if (!/^\s*display_name:\s*"newtype /m.test(text)) {
    throw new Error(`missing lowercase display_name: ${path.relative(repo, file)}`)
  }
  if (!/default_prompt:.*\$newtype-chief/m.test(text)) {
    throw new Error(`missing newtype-chief default prompt: ${path.relative(repo, file)}`)
  }
  console.log(`metadata ok ${path.relative(repo, file)}`)
}

async function models() {
  const proc = Bun.spawn([
    "bun",
    path.join(plugin, "scripts", "install-agents.ts"),
    "--dry-run",
    "--project",
    "/private/tmp/newtype-codex-model-check",
    "--force",
  ], {
    stdout: "pipe",
    stderr: "ignore",
    env: {
      ...Bun.env,
      newtype_codex_models_json: JSON.stringify({
        models: [
          { slug: "gpt-5.10", visibility: "list" },
          { slug: "gpt-6-mini", visibility: "list" },
          { slug: "gpt-6", visibility: "list" },
          { slug: "gpt-5.11-spark", visibility: "list" },
          { slug: "gpt-7", visibility: "hide" },
          { slug: "o4", visibility: "list" },
        ],
      }),
    },
  })
  const text = await new Response(proc.stdout).text()
  const status = await proc.exited
  if (status !== 0 || !text.includes("models: chief=gpt-6, strong=gpt-6, fast=gpt-6-mini")) {
    throw new Error("invalid model ranking")
  }
  console.log("model ok future gpt ranking")
}

async function bootstrap() {
  const project = "/private/tmp/newtype-codex-bootstrap-check"
  const installer = path.join(plugin, "scripts", "install-agents.ts")
  await rm(project, { recursive: true, force: true })

  const before = Bun.spawn(["bun", installer, "--status", "--project", project], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const beforeOutput = await new Response(before.stderr).text()
  if (await before.exited === 0 || !beforeOutput.includes("newtype agents missing")) {
    throw new Error("missing agents must fail the first-use status check")
  }

  const install = Bun.spawn(["bun", installer, "--project", project, "--inherit-model", "--force"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const installOutput = await new Response(install.stdout).text()
  if (await install.exited !== 0 || !installOutput.includes(".newtype-codex-agents.json")) {
    throw new Error("first-use install did not write the version marker")
  }

  const marker = await Bun.file(path.join(project, ".codex", "agents", ".newtype-codex-agents.json")).json()
  if (marker.pluginVersion !== "0.2.2" || marker.modelStrategy !== "inherit" || marker.agents?.length !== 8) {
    throw new Error("invalid agent version marker")
  }

  const markerPath = path.join(project, ".codex", "agents", ".newtype-codex-agents.json")
  await Bun.write(markerPath, JSON.stringify({ ...marker, pluginVersion: "0.2.1" }, null, 2) + "\n")
  const stale = Bun.spawn(["bun", installer, "--status", "--project", project], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const staleOutput = await new Response(stale.stderr).text()
  if (await stale.exited === 0 || !staleOutput.includes("installed=0.2.1, plugin=0.2.2")) {
    throw new Error("outdated agents must fail the version status check")
  }

  const refresh = Bun.spawn(["bun", installer, "--project", project, "--inherit-model", "--force"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  await new Response(refresh.stdout).text()
  if (await refresh.exited !== 0) throw new Error("outdated agents could not be refreshed")

  const chiefPath = path.join(project, ".codex", "agents", "newtype_chief.toml")
  const chief = await Bun.file(chiefPath).text()
  await Bun.write(chiefPath, chief.replace(/^name = .*$/m, (line) => `${line}\ndisplay_name = "newtype chief"`))
  const malformed = Bun.spawn(["bun", installer, "--status", "--project", project], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const malformedOutput = await new Response(malformed.stderr).text()
  if (await malformed.exited === 0 || !malformedOutput.includes("unsupported display_name")) {
    throw new Error("malformed agents must fail even when the version marker is current")
  }

  const repair = Bun.spawn(["bun", installer, "--project", project, "--inherit-model", "--force"], {
    stdout: "pipe",
    stderr: "pipe",
  })
  await new Response(repair.stdout).text()
  if (await repair.exited !== 0) throw new Error("malformed agents could not be repaired")

  const after = Bun.spawn(["bun", installer, "--status", "--project", project], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const afterOutput = await new Response(after.stdout).text()
  if (await after.exited !== 0 || !afterOutput.includes("agents are current for plugin 0.2.2")) {
    throw new Error("installed agents must pass the version status check")
  }

  await rm(project, { recursive: true, force: true })
  console.log("bootstrap ok missing -> install -> stale -> refresh -> malformed -> repair -> current")
}

const marketplace = await json(path.join(repo, ".agents", "plugins", "marketplace.json"))
const manifest = await json(path.join(plugin, ".codex-plugin", "plugin.json"))
if (marketplace.plugins?.filter((entry: { name?: string }) => entry.name === "newtype-codex").length !== 1) {
  throw new Error("marketplace must contain exactly one newtype-codex entry")
}
if (manifest.version !== "0.2.2") throw new Error("plugin version must be 0.2.2")
if (!Array.isArray(manifest.interface?.defaultPrompt) || manifest.interface.defaultPrompt.length > 3) {
  throw new Error("plugin defaultPrompt must contain at most three entries")
}

exists(path.join(plugin, "references", "newtype-agent-workflow.md"))
exists(path.join(plugin, "assets", "composer-icon.svg"))
exists(path.join(plugin, "assets", "logo.svg"))

const brand = new RegExp(`${"New"}${"type"}|${"NEW"}${"TYPE"}`)
const forbiddenScores = new RegExp(
  `${"QUALITY"} ${"SCORES"}:|${"OVER"}${"ALL"}:\\s*X\\.XX|${"WEAK"}${"EST"}:`,
)
const legacyInvocations = /\$newtype-(archive|edit|extract|fact-check|install-agents|research|workbench|write)\b/

for await (const file of new Bun.Glob("**/*.{md,json,toml,ts,svg,yaml,yml}").scan({ cwd: repo, absolute: true })) {
  if (file.includes("node_modules")) continue
  const text = await Bun.file(file).text()
  if (brand.test(text)) throw new Error(`brand case violation: ${path.relative(repo, file)}`)
  if (forbiddenScores.test(text)) throw new Error(`user-visible numeric self-score: ${path.relative(repo, file)}`)
  if (legacyInvocations.test(text)) throw new Error(`legacy skill invocation: ${path.relative(repo, file)}`)
}
console.log("content ok brand, quality gate, and legacy invocations")
await models()
await bootstrap()

const skillNames: string[] = []
for await (const file of new Bun.Glob("*/SKILL.md").scan({ cwd: path.join(plugin, "skills"), absolute: true })) {
  skillNames.push(path.basename(path.dirname(file)))
  await skill(file)
}
skillNames.sort()
if (JSON.stringify(skillNames) !== JSON.stringify(expectedSkills)) {
  throw new Error(`expected skills ${expectedSkills.join(", ")}; got ${skillNames.join(", ")}`)
}

const chiefSkill = await Bun.file(path.join(plugin, "skills", "newtype-chief", "SKILL.md")).text()
if (!chiefSkill.includes("--status --global") || !chiefSkill.includes("First-Use Bootstrap")) {
  throw new Error("newtype-chief must include first-use agent bootstrap")
}

const metadataFiles: string[] = []
for await (const file of new Bun.Glob("*/agents/openai.yaml").scan({ cwd: path.join(plugin, "skills"), absolute: true })) {
  metadataFiles.push(path.basename(path.dirname(path.dirname(file))))
  await metadata(file)
}
metadataFiles.sort()
if (JSON.stringify(metadataFiles) !== JSON.stringify(expectedSkills)) {
  throw new Error(`expected metadata for ${expectedSkills.join(", ")}; got ${metadataFiles.join(", ")}`)
}

const agentFiles: string[] = []
for await (const file of new Bun.Glob("*.toml").scan({ cwd: path.join(plugin, "templates", "agents"), absolute: true })) {
  agentFiles.push(path.basename(file))
  await toml(file)
}
agentFiles.sort()
if (JSON.stringify(agentFiles) !== JSON.stringify(expectedAgents)) {
  throw new Error(`expected eight agent templates; got ${agentFiles.join(", ")}`)
}

console.log("newtype-codex check passed: 1 skill + 8 agents + first-use bootstrap")
