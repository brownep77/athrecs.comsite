import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import * as service from "../src/lib/club-scanner/service.server.ts";
export { service };
export const sourceUrl = "https://totalracetiming.co.uk/raceresults/100001";
export const headers = [
  "Position",
  "Forename",
  "Surname",
  "Gender",
  "Gender Pos",
  "Category",
  "Cat Pos",
  "Club",
  "Tag",
  "Wava",
  "Gun Time",
  "Chip Time",
];
export const sampleRows = [
  [
    "1",
    "Fresh",
    "Runner",
    "F",
    "1",
    "F40",
    "1",
    "Example AC",
    "21",
    "70.1",
    "00:42:10.2",
    "00:42:08.7",
  ],
  [
    "2",
    "Known",
    "Runner",
    "M",
    "1",
    "M40",
    "1",
    "Example AC",
    "22",
    "68.1",
    "00:43:10.2",
    "00:43:08.7",
  ],
  [
    "3",
    "Managed",
    "Runner",
    "F",
    "2",
    "F40",
    "2",
    "Example AC",
    "23",
    "65.1",
    "00:44:10.2",
    "00:44:08.7",
  ],
  [
    "4",
    "Private",
    "Runner",
    "F",
    "3",
    "F40",
    "3",
    "Example AC",
    "24",
    "63.1",
    "00:45:10.2",
    "00:45:08.7",
  ],
  [
    "5",
    "Alex",
    "Variant",
    "M",
    "2",
    "M40",
    "2",
    "Example AC",
    "25",
    "62.1",
    "00:46:10.2",
    "00:46:08.7",
  ],
  [
    "6",
    "A",
    "Initial",
    "M",
    "3",
    "M40",
    "3",
    "Example AC",
    "26",
    "61.1",
    "00:47:10.2",
    "00:47:08.7",
  ],
  [
    "7",
    "Not",
    "Member",
    "F",
    "4",
    "F40",
    "4",
    "Other Example AC",
    "27",
    "60.1",
    "00:48:10.2",
    "00:48:08.7",
  ],
];
export function sourceHtml(rows = sampleRows, date = "15/05/2025") {
  return `<h2>Example Road Race</h2><h3 id="sr100001">10k</h3><p>Start time: ${date} 10:00</p><table><thead><tr>${headers.map((h) => `<th>${h.replace("Gender Pos", "Gender<br>Pos").replace("Cat Pos", "Cat<br>Pos")}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
export const indexHtml = `<table><thead><tr><th>Name</th><th></th><th>Date</th><th>Location</th></tr></thead><tbody><tr><td><a href="/raceresults/100001">Example Road Race</a></td><td></td><td>15th May 25</td><td>Example</td></tr></tbody></table>`;
export const scope = {
  clubId: 1,
  aliases: ["Example AC"],
  dateFrom: "2025-01-01",
  dateTo: "2025-12-31",
  discover: true,
  urls: [],
};
export async function fixture() {
  const db = new PGlite();
  function sqlFor(connection) {
    const sql = async (strings, ...values) =>
      (
        await connection.query(
          strings.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
          values,
        )
      ).rows;
    sql.query = async (q, p = []) => (await connection.query(q, p)).rows;
    sql.transaction = (work) => connection.transaction((tx) => work(sqlFor(tx)));
    return sql;
  }
  const sql = sqlFor(db);
  await db.exec(`create table clubs(id serial primary key,name text,source_names text default '');insert into clubs values(1,'Example AC','');
 create table athletes(id serial primary key,slug text unique,display_name text,gender text,club_id integer,source_club_name text,profile_visibility text default 'private',bio text default '',county text,country text);
 insert into athletes(slug,display_name,gender,club_id,source_club_name,profile_visibility) values('known-runner','Known Runner','M',1,'Example AC','public'),('managed-runner','Managed Runner','F',1,'Example AC','public'),('private-runner','Private Runner','F',1,'Example AC','private'),('alexander-variant','Alexander Variant','M',1,'Example AC','public');
 create view athlete_resolved_ids as select id as athlete_id,id+1000 as athlete_number from athletes;
 create table athlete_account_links(athlete_id integer,status text);insert into athlete_account_links values(2,'active');
 create table editions(id serial primary key,event_date date);create table results(id serial primary key,athlete_id integer,edition_id integer);
 `);
  for (const name of [
    "0035_athlete_source_histories.sql",
    "0036_source_history_publication.sql",
    "20260922_club_athlete_scanner.sql",
  ])
    await db.exec(await readFile(new URL("../migrations/" + name, import.meta.url), "utf8"));
  const fetcher = async (url) => (url.endsWith("/result") ? indexHtml : sourceHtml());
  return { db, sql, fetcher, close: () => db.close() };
}
