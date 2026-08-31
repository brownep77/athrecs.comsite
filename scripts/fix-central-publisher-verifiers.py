#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: Path, before: str, after: str) -> None:
    text = path.read_text()
    if after in text:
        return
    if before not in text:
        raise SystemExit(f"Anchor not found in {path}: {before[:180]!r}")
    path.write_text(text.replace(before, after, 1))


prominent = Path("scripts/verify-uk-ireland-prominent-races.mjs")
replace_once(
    prominent,
    'const packageSource = JSON.parse(await readFile("package.json", "utf8"));\n',
    'const packageSource = JSON.parse(await readFile("package.json", "utf8"));\n'
    'const guardedBuildPublisherSource = await readFile("scripts/publish-after-build.mjs", "utf8");\n',
)
replace_once(
    prominent,
    '''assert(
  packageSource.scripts.build.includes("publish-uk-ireland-prominent-races.mjs"),
  "Production build does not run the reviewed publication batch",
);''',
    '''assert(
  packageSource.scripts.build.includes("publish-after-build.mjs") &&
    guardedBuildPublisherSource.includes("scripts/publish-uk-ireland-prominent-races.mjs"),
  "Production build does not run the reviewed publication batch through its guard",
);''',
)

home = Path("scripts/verify-uk-home-nation-championships.mjs")
replace_once(
    home,
    'const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");\n',
    'const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");\n'
    'const guardedBuildPublisherSource = await readFile(\n'
    '  new URL("./publish-after-build.mjs", import.meta.url),\n'
    '  "utf8",\n'
    ');\n',
)
replace_once(
    home,
    'assert(packageSource.includes("publish-uk-home-nation-championships.mjs"));',
    'assert(packageSource.includes("publish-after-build.mjs"));\n'
    'assert(guardedBuildPublisherSource.includes("scripts/publish-uk-home-nation-championships.mjs"));',
)

print("Central publisher verifier repairs applied.")
