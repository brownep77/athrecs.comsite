"""Store a supervised Trackie batch in the private source inbox only.

No canonical result, athlete, claim or publication table is modified. The
connection file is private and must identify the explicitly selected branch.
Original PDF bytes are kept in the legacy source_html_gzip column, with their
MIME type recorded in payload.sourceMimeType. Do not decode them as HTML.
"""
import argparse
import base64
import datetime as dt
import gzip
import hashlib
import json
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--connection", type=Path, required=True)
    parser.add_argument("--confirm-branch", required=True)
    parser.add_argument("--approval-id", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args()
    config = json.loads(args.connection.read_text())
    if config["branchId"] != args.confirm_branch:
        raise ValueError("Connection branch differs from the selected branch")
    connection = config["databaseUrl"]
    host = urllib.parse.urlsplit(connection).hostname
    if not host or not host.endswith(".neon.tech"):
        raise ValueError("Expected the selected Neon connection")
    endpoint = "https://" + host.replace("-pooler", "") + "/sql"
    run_id = str(uuid.UUID(args.run_id))

    def query(statements):
        request = urllib.request.Request(endpoint,
            data=json.dumps({"queries":[{"query":s,"params":p} for s,p in statements]}).encode(),
            headers={"Content-Type":"application/json", "Neon-Connection-String":connection,
                     "Neon-Batch-Isolation-Level":"ReadCommitted"})
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read())["results"]

    # Read-only target check precedes all writes. A live non-revoked owner
    # approval must have been registered separately through the authenticated API.
    approval = query([("SELECT id FROM result_archive_capture_approvals WHERE id=$1 AND provider='Trackie' AND scope='staff_only' AND revoked_at IS NULL",[args.approval_id])])[0]
    if len(approval["rows"]) != 1:
        raise ValueError("Active source-specific approval is missing")
    receipts = []
    for capture_path in sorted(args.directory.glob("*.capture.json")):
        capture = json.loads(capture_path.read_text())
        payload = capture["payload"]
        raw = Path(capture["sourcePath"]).read_bytes()
        if hashlib.sha256(raw).hexdigest() != capture["sourceSha256"]:
            raise ValueError("Original PDF changed")
        if capture["rows"] != len(payload["rows"]) or payload["publication"] != "staff_only":
            raise ValueError("Capture count or publication mismatch")
        if capture["state"] == "compared" and (capture["issues"] or not all(r["independentTextCompared"] for r in payload["rows"])):
            raise ValueError("Source comparison incomplete")
        encoded = json.dumps(payload,sort_keys=True,ensure_ascii=False,separators=(",",":"))
        digest = hashlib.sha256(encoded.encode()).hexdigest()
        audit = dict(sourceRowsCompared=capture["rows"] if capture["state"]=="compared" else 0,
                     athleteIdentityVerified=False, publication="staff_only", parserIssues=capture["issues"],
                     parser="prepare-trackie-captures-v1", comparison="pdfplumber row text versus PyMuPDF row text",
                     sourceMimeType="application/pdf", canonicalResultsWritten=0)
        result = query([("""INSERT INTO result_archive_source_captures
          (run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
          SELECT r.id,a.id,'Trackie',$3,$4,$5,$6,decode($7,'base64'),$8::jsonb,$9,$10,$11::jsonb,$12::timestamptz
          FROM result_archive_capture_approvals a JOIN result_archive_capture_runs r ON r.approval_id=a.id
          WHERE a.id=$1 AND r.id=$2::uuid AND a.provider='Trackie' AND a.scope='staff_only' AND a.revoked_at IS NULL
          ON CONFLICT(provider,source_key,payload_hash) DO UPDATE SET last_seen_at=now()
          RETURNING id,source_key,row_count,source_check,payload_hash""",
          [args.approval_id,run_id,payload["sourceKey"],payload["sourceUrl"],digest,capture["sourceSha256"],
           base64.b64encode(gzip.compress(raw)).decode(),encoded,capture["rows"],capture["state"],json.dumps(audit),capture["capturedAt"]])])[0]
        if len(result["rows"]) != 1 or int(result["rows"][0]["row_count"]) != capture["rows"]:
            raise ValueError("Database did not confirm capture")
        receipts.append(result["rows"][0])
        (args.directory/"database-receipts.json").write_text(json.dumps(receipts,indent=2))
        print(json.dumps({k:result["rows"][0][k] for k in ("id","source_key","row_count","source_check")}),flush=True)
    summary=json.loads((args.directory/"summary.json").read_text())
    totals=dict(indexListings=len(summary),storedFiles=len(receipts),
                comparedFiles=sum(r["state"]=="compared" for r in summary),
                comparedRows=sum(r["rows"] for r in summary if r["state"]=="compared"),
                heldFiles=sum(r["state"]=="held" for r in summary),
                unavailableListings=sum(r["state"]=="unavailable-or-unsupported" for r in summary),
                externalRedirectListings=sum(r["state"]=="external-redirect" for r in summary),
                publicResultsWritten=0,athleteAccountsChanged=0,details=summary)
    query([("UPDATE result_archive_capture_runs SET status='partial',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid RETURNING id",[run_id,json.dumps(totals)])])
    (args.directory/"database-summary.json").write_text(json.dumps(totals,indent=2))
    print(json.dumps({k:v for k,v in totals.items() if k!='details'}))


if __name__ == "__main__":
    main()
