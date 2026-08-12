from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_required(text: str, old: str, new: str, path: str, minimum: int = 1) -> str:
    count = text.count(old)
    if count < minimum:
        raise SystemExit(f"{path}: expected at least {minimum} occurrence(s) of {old!r}, found {count}")
    return text.replace(old, new)

# TanStack Start requires server-function outputs to be serializable. The shared
# SQL abstraction previously defaulted untyped rows to Record<string, unknown>,
# which correctly described arbitrary SQL data but made those rows fail the
# framework's compile-time serializability check. Model the actual JSON-safe
# values returned by src/lib/db.ts instead.
path = "src/lib/db.ts"
text = read(path)
marker = "export interface Sql {"
json_types = '''export type SqlJsonValue =\n  | string\n  | number\n  | boolean\n  | null\n  | SqlJsonValue[]\n  | { [key: string]: SqlJsonValue };\n\nexport type SqlRow = Record<string, SqlJsonValue>;\n\n'''
if "export type SqlJsonValue" not in text:
    text = replace_required(text, marker, json_types + marker, path)
text = replace_required(text, "Record<string, unknown>", "SqlRow", path, minimum=3)
write(path, text)

path = "src/lib/athrecs/transaction.server.ts"
text = read(path)
text = replace_required(
    text,
    'import { dbSource, getPglite, type Sql } from "@/lib/db";',
    'import { dbSource, getPglite, type Sql, type SqlRow } from "@/lib/db";',
    path,
)
text = replace_required(text, "Record<string, unknown>", "SqlRow", path, minimum=2)
write(path, text)

path = "src/lib/athrecs/access.server.ts"
text = read(path)
text = replace_required(
    text,
    'import { getSql } from "@/lib/db";',
    'import { getSql, type SqlJsonValue } from "@/lib/db";',
    path,
)
text = replace_required(
    text,
    "Record<string, unknown>",
    "Record<string, SqlJsonValue>",
    path,
    minimum=3,
)
write(path, text)

path = "src/lib/athrecs/athlete-backend.ts"
text = read(path)
text = replace_required(
    text,
    'import { getSql } from "@/lib/db";',
    'import { getSql, type SqlRow } from "@/lib/db";',
    path,
)
text = replace_required(
    text,
    "sql<Record<string, unknown>>",
    "sql<SqlRow>",
    path,
)
write(path, text)

path = "src/lib/athrecs/multisport-public-api.ts"
text = read(path)
text = replace_required(
    text,
    'import { getSql } from "@/lib/db";',
    'import { getSql, type SqlRow } from "@/lib/db";',
    path,
)
text = replace_required(
    text,
    "as Record<string, unknown> | undefined",
    "as SqlRow | undefined",
    path,
)
write(path, text)

path = "src/lib/athrecs/organiser-backend.ts"
text = read(path)
text = replace_required(
    text,
    'import type { Sql } from "@/lib/db";',
    'import type { Sql, SqlRow } from "@/lib/db";',
    path,
)
text = replace_required(
    text,
    "sql<Record<string, unknown>>",
    "sql<SqlRow>",
    path,
    minimum=4,
)
write(path, text)

path = "src/lib/athrecs/verification-backend.ts"
text = read(path)
text = replace_required(
    text,
    'import type { Sql } from "@/lib/db";',
    'import type { Sql, SqlRow } from "@/lib/db";',
    path,
)
text = replace_required(
    text,
    "sql<Record<string, unknown>",
    "sql<SqlRow",
    path,
    minimum=4,
)
text = replace_required(
    text,
    "as Record<string, unknown> | undefined",
    "as SqlRow | undefined",
    path,
)
write(path, text)

print("Applied JSON-safe SQL row typing for TanStack server-function outputs.")

# This temporary file is removed by the successful staging installer commit.
