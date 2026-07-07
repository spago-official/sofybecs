import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";

const outDir = "_site";
const internalExport = process.env.INTERNAL_SITE_EXPORT === "1";
const allowedSources = new Set(["app_store", "google_play"]);

async function main() {
  if (!internalExport) {
    // fail closed: 明示的に有効化されたデプロイ以外はデータを出さない
    await mkdir(outDir, { recursive: true });
    await copyFile("web/internal-only.html", `${outDir}/index.html`);
    await writeFile(`${outDir}/items.json`, "[]\n", "utf8");
    await writeFile(`${outDir}/robots.txt`, "User-agent: *\nDisallow: /\n", "utf8");
    return;
  }

  // React アプリをビルド（vite が outDir を空にしてから出力する）
  execFileSync("npx", ["vite", "build"], { stdio: "inherit" });

  const raw = await readFile("data/items.json", "utf8");
  const items = JSON.parse(raw).filter(item => allowedSources.has(item.source));
  await writeFile(`${outDir}/items.json`, `${JSON.stringify(items, null, 1)}\n`, "utf8");
  await writeFile(`${outDir}/robots.txt`, "User-agent: *\nDisallow: /\n", "utf8");
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
