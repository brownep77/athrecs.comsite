-- Keep the explicit results-only review projection bounded without scanning the directory.
-- No athlete data is changed by this migration. Staff apply reviewed holds separately.
CREATE INDEX IF NOT EXISTS athlete_results_only_name_review
ON athletes(id)
WHERE profile_details#>>'{nameReview,mode}'='results_only';
