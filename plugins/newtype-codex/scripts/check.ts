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

await json(path.join(repo, ".agents", "plugins", "marketplace.json"))
await json(path.join(plugin, ".codex-plugin", "plugin.json"))
exists(path.join(plugin, "references", "newtype-agent-workflow.md"))

const brand = new RegExp(`${"New"}${"type"}|${"NEW"}${"TYPE"}`)

for await (const file of new Bun.Glob("**/*.{md,json,toml,ts}").scan({ cwd: repo, absolute: true })) {
  if (file.includes("node_modules")) continue
  const text = await Bun.file(file).text()
  if (brand.test(text)) {
    throw new Error(`brand case violation: ${path.relative(repo, file)}`)
  }
}
console.log("brand ok newtype")

for await (const file of new Bun.Glob("*/SKILL.md").scan({ cwd: path.join(plugin, "skills"), absolute: true })) {
  await skill(file)
}

for await (const file of new Bun.Glob("*.toml").scan({ cwd: path.join(plugin, "templates", "agents"), absolute: true })) {
  await toml(file)
}

console.log("newtype-codex check passed")
