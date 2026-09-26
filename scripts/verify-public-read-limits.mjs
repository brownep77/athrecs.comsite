import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { z } from "zod";
import { PGlite } from "@electric-sql/pglite";

// Run the real public handlers and SQL against synthetic data only.
function compile(source, bindings) {
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function("exports", ...Object.keys(bindings), output)(exports, ...Object.values(bindings));
  return exports;
}
const limits = compile(
  readFileSync("src/lib/athrecs/public-read-limits.ts", "utf8").replace(/^import .*;\n/gm, ""),
  { z },
);
const db = new PGlite();
await db.waitReady;
let queryCount = 0;
const sql = async (strings, ...values) => {
  let query = strings[0];
  values.forEach((_, index) => {
    query += `$${index + 1}${strings[index + 1]}`;
  });
  assert.match(query.trim(), /^select\s/i, "Public reads must not write data");
  queryCount++;
  return (await db.query(query, values)).rows;
};
function handlers(runrecs) {
  const file = ts.createSourceFile(
    "api.ts",
    readFileSync("src/lib/athrecs/api.ts", "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const source = file.statements
    .filter(
      (statement) =>
        ts.isVariableStatement(statement) &&
        statement.declarationList.declarations.some((d) =>
          ["listAthletes", "getEditionResults"].includes(d.name.getText(file)),
        ),
    )
    .map((statement) => statement.getText(file))
    .join("\n");
  assert(source.includes("getEditionResults") && source.includes("listAthletes"));
  const createServerFn = ({ method }) => {
    assert.equal(method, "GET");
    return {
      validator: (validate) => ({
        handler:
          (run) =>
          ({ data } = {}) =>
            run({ data: validate(data) }),
      }),
    };
  };
  return compile(source, {
    createServerFn,
    IS_RUNRECS_SITE: runrecs,
    ...limits,
    ready: async () => sql,
    readResultDetails: (value) => value,
    getReportedRaceHistory: () => null,
  });
}
try {
  await db.exec(`
    create table clubs(id integer primary key, name text, slug text);
    create table athletes(id integer primary key, slug text, display_name text, gender text,
      city text, county text, country text, profile_type text, profile_roles text,
      profile_visibility text, club_id integer);
    create table results(id integer primary key, edition_id integer, athlete_id integer,
      status text, result_details jsonb, overall_place integer, finish_time_seconds integer,
      category text, result_visibility text);
    create table athlete_account_links(user_id text, athlete_id integer, status text);
    create table athlete_public_shares(user_id text, enabled boolean, share_results boolean);
    create table athlete_profile_hidden_results(user_id text, result_id integer);
    insert into clubs values (1, 'Example Club', 'example-club');
    insert into athletes
      select n, 'synthetic-' || n, 'Synthetic ' || lpad(n::text, 3, '0'), 'M',
        'Example town', '', 'United Kingdom', 'Athlete', '', 'public', 1
      from generate_series(1, 130) n;
    insert into results
      select n, 1, n, 'Finished', '{}', n, 1800 + n, 'Senior', 'public'
      from generate_series(1, 130) n;
    update athletes set profile_visibility='private' where id=1;
    insert into athlete_account_links values ('disabled',2,'active'), ('hidden',3,'active'),
      ('no-results',4,'active'), ('inactive',5,'revoked');
    insert into athlete_public_shares values ('disabled',false,true), ('hidden',true,true),
      ('no-results',true,false), ('inactive',false,false);
    insert into athlete_profile_hidden_results values ('hidden',3);
    update results set result_visibility='private' where id=6;
  `);
  const before = JSON.stringify((await db.query("select * from results order by id")).rows);
  const athrecs = handlers(false);
  const first = await athrecs.listAthletes({ data: { limit: 100000, pageSize: 100000 } });
  assert.equal(first.length, 48, "RPC callers cannot request the entire directory");
  assert(!first.some((a) => [1, 2].includes(a.id)), "Private and disabled profiles stay hidden");
  for (const id of [3, 4, 6]) assert.equal(first.find((a) => a.id === id).result_count, 0);
  assert.equal(
    first.find((a) => a.id === 5).result_count,
    1,
    "Revoked ownership does not hide a profile",
  );
  const second = await athrecs.listAthletes({ data: { offset: 48 } });
  assert.equal(second.length, 48);
  assert(!second.some((a) => first.some((b) => a.id === b.id)), "Pagination must not repeat rows");
  const search = await athrecs.listAthletes({ data: { q: "Synthetic 130" } });
  assert.deepEqual(
    search.map((a) => a.id),
    [130],
    "Profiles beyond the first page remain searchable",
  );
  const results = await athrecs.getEditionResults({ data: 1 });
  assert.equal(results.length, 100, "Race previews cannot return unbounded results");
  for (const id of [1, 2, 3, 4, 6]) assert(!results.some((r) => r.id === id));
  assert(results.some((r) => r.id === 5));
  for (const data of [0, -1, 1.5, Infinity, "1", {}, 2147483648]) {
    const count = queryCount;
    await assert.rejects(async () => athrecs.getEditionResults({ data }));
    assert.equal(queryCount, count, "Invalid requests must be rejected before querying");
  }
  for (const data of [
    { q: "x".repeat(121) },
    { q: [] },
    { offset: -1 },
    { offset: 1.5 },
    { offset: Infinity },
    { offset: 100001 },
  ]) {
    await assert.rejects(async () => athrecs.listAthletes({ data }));
  }
  const runrecs = handlers(true);
  assert.equal(
    (await runrecs.listAthletes()).length,
    129,
    "RunRecs retains the existing list behaviour",
  );
  assert.equal(
    (await runrecs.getEditionResults({ data: 1 })).length,
    129,
    "RunRecs retains its existing results behaviour",
  );
  assert.equal(JSON.stringify((await db.query("select * from results order by id")).rows), before);
  console.log(
    "Public read guards verified: fixed caps, pagination, search, privacy, validation, read-only SQL and RunRecs isolation.",
  );
} finally {
  await db.close();
}
