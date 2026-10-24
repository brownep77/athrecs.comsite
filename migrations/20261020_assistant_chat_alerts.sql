-- Private notification outbox. Deleting a conversation removes its queued alerts.
CREATE TABLE IF NOT EXISTS assistant_chat_alerts (
  message_id bigint PRIMARY KEY REFERENCES assistant_messages(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  destination_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'accepted', 'failed', 'uncertain', 'expired', 'limited')),
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  processing_at timestamptz,
  provider_id text,
  last_error text
);
CREATE INDEX IF NOT EXISTS assistant_chat_alerts_pending
  ON assistant_chat_alerts(next_attempt_at) WHERE status = 'pending';
