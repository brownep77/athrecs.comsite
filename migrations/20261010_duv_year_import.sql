-- Durable private DUV acquisition. No public/data-API row policy is added.
CREATE TABLE IF NOT EXISTS result_archive_import_jobs (
 id text PRIMARY KEY,
 provider text NOT NULL,
 year integer NOT NULL CHECK(year BETWEEN 1900 AND 2200),
 approval_id text NOT NULL REFERENCES result_archive_capture_approvals(id),
 run_id uuid NOT NULL REFERENCES result_archive_capture_runs(id),
 status text NOT NULL CHECK(status IN ('paused','running','blocked','completed','completed_with_holds')),
 inventory_count integer NOT NULL CHECK(inventory_count>=0),
 expected_source_rows integer,
 next_request_at timestamptz NOT NULL DEFAULT now(),
 lease_owner text,
 lease_until timestamptz,
 expires_at timestamptz NOT NULL,
 last_error text,
 configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS result_archive_import_queue (
 job_id text NOT NULL REFERENCES result_archive_import_jobs(id),
 source_key text NOT NULL,
 source_url text NOT NULL CHECK(source_url ~ '^https://statistik[.]d-u-v[.]org/getresultevent[.]php[?]event=[0-9]+$'),
 inventory jsonb NOT NULL,
 ordinal integer NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','imported','held','error')),
 attempts integer NOT NULL DEFAULT 0,
 source_html_gzip bytea,
 html_sha256 text,
 captured_at timestamptz,
 capture_id bigint REFERENCES result_archive_source_captures(id),
 row_cursor integer NOT NULL DEFAULT 0,
 rows_total integer,
 error text,
 receipt jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(job_id,source_key), UNIQUE(job_id,source_url)
);
CREATE INDEX IF NOT EXISTS result_archive_queue_next ON result_archive_import_queue(job_id,status,ordinal);
CREATE TABLE IF NOT EXISTS result_archive_import_matches (
 job_id text NOT NULL,
 source_key text NOT NULL,
 source_row integer NOT NULL,
 source_athlete_id text,
 athlete_id integer REFERENCES athletes(id),
 status text NOT NULL CHECK(status IN ('created','linked','held','existing_result')),
 reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(job_id,source_key,source_row),
 FOREIGN KEY(job_id,source_key) REFERENCES result_archive_import_queue(job_id,source_key)
);
CREATE TABLE IF NOT EXISTS result_archive_identity_clock (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 version bigint NOT NULL DEFAULT 0
);
INSERT INTO result_archive_identity_clock(singleton) VALUES(true) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION bump_result_archive_identity_clock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 UPDATE public.result_archive_identity_clock SET version=version+1 WHERE singleton;
 RETURN NULL;
END $$;
-- Statement triggers invalidate the cached identity directory when any relevant
-- profile, account or external source association changes. No PII is copied here.
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['athletes','user','athlete_private_profiles','athlete_account_links','athlete_source_histories'] LOOP
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid=to_regclass(quote_ident(t)) AND tgname='result_archive_identity_changed') THEN
   EXECUTE format('CREATE TRIGGER result_archive_identity_changed AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH STATEMENT EXECUTE FUNCTION bump_result_archive_identity_clock()',t);
  END IF;
 END LOOP;
END $$;
ALTER TABLE result_archive_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_archive_import_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_archive_import_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_archive_identity_clock ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON result_archive_import_jobs,result_archive_import_queue,result_archive_import_matches,result_archive_identity_clock FROM public;
CREATE TABLE IF NOT EXISTS result_archive_import_documents (
 job_id text NOT NULL,
 source_key text NOT NULL,
 source_url text NOT NULL CHECK(source_url ~ '^https://statistik[.]d-u-v[.]org/getresultevent[.]php[?]event=[0-9]+(&page=[0-9]+)?$'),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','captured','held')),
 source_html_gzip bytea,
 html_sha256 text,
 captured_at timestamptz,
 payload jsonb,
 error text,
 PRIMARY KEY(job_id,source_key,source_url),
 FOREIGN KEY(job_id,source_key) REFERENCES result_archive_import_queue(job_id,source_key)
);
ALTER TABLE result_archive_import_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON result_archive_import_documents FROM public;

REVOKE ALL ON FUNCTION bump_result_archive_identity_clock() FROM public;
