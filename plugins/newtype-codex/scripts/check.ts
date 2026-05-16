import { existsSync } from "node:fs"
import path from "node:path"

const repo = path.resolve(import.meta.dir, "..", "..", "..")
const plugin = path.join(repo, "plugins", "newtype-codex")

async function json(file: string) {
  JSON.parse(await Bun.file(file).text())
  console.log(`json ok ${path.relative(repo, file)}`)
}

function exists(file: string) {
  if (!existsSync(file)) throw new Error(`missing ${path.relative(repo, file)}`)
  console.log(`exists ${path.relative(repo, file)}`)
}

async function skill(file: string) {
  const text = await Bun.file(file).text()
  if (!/^---\nname: .+\ndescription: .+\n---/s.test(text)) {
    throw new Error(`invalid skill frontmatter: ${path.relative(repo, file)}`)
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
  console.log(`agent ok ${path.relative(repo, file)}`)
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

await json(path.join(repo, ".agents", "plugins", "marketplace.json"))
await json(path.join(plugin, ".codex-plugin", "plugin.json"))
exists(path.join(plugin, "references", "newtype-agent-workflow.md"))
exists(path.join(plugin, "assets", "composer-icon.svg"))
exists(path.join(plugin, "assets", "logo.svg"))

const brand = new RegExp(`${"New"}${"type"}|${"NEW"}${"TYPE"}`)

for await (const file of new Bun.Glob("**/*.{md,json,toml,ts,svg}").scan({ cwd: repo, absolute: true })) {
  if (file.includes("node_modules")) continue
  const text = await Bun.file(file).text()
  if (brand.test(text)) {
    throw new Error(`brand case violation: ${path.relative(repo, file)}`)
  }
}
console.log("brand ok newtype")
await models()

for await (const file of new Bun.Glob("*/SKILL.md").scan({ cwd: path.join(plugin, "skills"), absolute: true })) {
  await skill(file)
}

for await (const file of new Bun.Glob("*.toml").scan({ cwd: path.join(plugin, "templates", "agents"), absolute: true })) {
  await toml(file)
}

console.log("newtype-codex check passed")
