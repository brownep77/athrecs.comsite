-- Private support transcripts. No public athlete/profile joins or publication.
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id uuid PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  language text NOT NULL,
  page_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  processing_until timestamptz,
  active_request uuid
);
CREATE INDEX IF NOT EXISTS assistant_conversations_updated ON assistant_conversations(updated_at DESC);
CREATE TABLE IF NOT EXISTS assistant_messages (
  id bigserial PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (length(content) <= 4000),
  language text NOT NULL,
  status text NOT NULL DEFAULT 'complete' CHECK (status IN ('complete', 'unavailable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, request_id, role)
);
CREATE INDEX IF NOT EXISTS assistant_messages_conversation ON assistant_messages(conversation_id, id);
CREATE TABLE IF NOT EXISTS assistant_usage (
  bucket text PRIMARY KEY,
  turns integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL
);
