import { mkdir, copyFile, readFile } from "node:fs/promises";
import { Script } from "node:vm";
if (process.env.VERCEL_ENV === "production") throw new Error("This branch is a design preview and must not be deployed to production.");
await mkdir("design-preview/dist", { recursive: true });
for (const filename of ["index.html", "modern.html"]) {
  const html = await readFile("design-preview/" + filename, "utf8");
  const script = html.split("<script>")[1]?.split("</script>")[0];
  if (!script) throw new Error("Preview script missing: " + filename);
  new Script(script);
  for (const marker of ["Countries", "Distances", "Surfaces", "requestFullscreen", 'data-view="rows"', 'data-view="cards"', 'data-view="table"', 'data-view="agenda"']) if (!html.includes(marker)) throw new Error("Missing " + marker + " in " + filename);
  await copyFile("design-preview/" + filename, "design-preview/dist/" + filename);
}
console.log("RunRecs original and modern design previews built; four layouts and all selectors present.");
