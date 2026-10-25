#!/usr/bin/env python3
"""Check a private source-identity review and freeze a receipt. No network or DB."""

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
HELPER = ROOT / "scripts/lib/reviewed-source-identity-policy.py"
SPEC = importlib.util.spec_from_file_location("reviewed_source_identity_policy", HELPER)
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)


def file_sha(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    source, output = args.review.resolve(), args.output.resolve()
    policy.require(source.is_file() and source.stat().st_size <= 16 * 1024 * 1024,
                   "Use a bounded private review file (at most 16 MiB)")
    policy.require(not source.is_relative_to(ROOT) and not output.is_relative_to(ROOT),
                   "Private review inputs and receipts must stay outside the Git checkout")
    policy.require(not output.exists(), "Receipt already exists; use a new immutable output path")
    raw = source.read_bytes()
    manifest = json.loads(raw)
    receipt = policy.evaluate_review(manifest)
    checked = []
    for evidence in manifest["evidenceFiles"]:
        path = Path(evidence["path"])
        path = (source.parent / path).resolve() if not path.is_absolute() else path.resolve()
        policy.require(path.is_file(), "Missing evidence file: " + evidence["id"])
        policy.require(file_sha(path) == evidence["sha256"], "Evidence file changed: " + evidence["id"])
        checked.append({**evidence, "path": str(path)})
    receipt.update({"reviewFile": {"path": str(source), "sha256": hashlib.sha256(raw).hexdigest()},
                    "evidenceFiles": checked, "evidenceFileHashesChecked": True,
                    "codePins": {str(path.relative_to(ROOT)): file_sha(path) for path in
                                 (Path(__file__).resolve(), HELPER, ROOT / "docs/reviewed-source-identity-policy.md")},
                    "limitations": ["Manual source/name judgments are recorded, not independently re-proven by this helper.",
                                    "The publisher must independently compare the complete current candidate/collision sets and all source/privacy/claim guards.",
                                    "Weak fuzzy nonblocking findings cannot be encoded as different_person for the frozen London publisher."]})
    descriptor = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as handle:
        json.dump(receipt, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
    print(json.dumps({"receipt": str(output), "sha256": file_sha(output), "counts": receipt["counts"],
                      "publicationAuthorized": False}, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as exc:
        raise SystemExit(str(exc)) from exc
