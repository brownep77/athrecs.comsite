-- Keep original performances visible with the specific, sourced decision.
-- Reasons are result-level: never infer a failed drug test from a whereabouts case.
alter table results add column if not exists result_details jsonb not null default '{}'::jsonb;
alter table results add constraint result_details_disqualification_status check (
  jsonb_typeof(result_details) = 'object' and (
    not (result_details ? 'disqualification') or (
      status = 'DQ'
      and coalesce(result_details->'disqualification'->>'reason', '')
        in ('whereabouts', 'positive_test', 'other')
      and coalesce(result_details->'disqualification'->>'sourceUrl', '') like 'https://%'
      and coalesce(result_details->'disqualification'->>'decisionDate', '') ~ '^\d{4}-\d{2}-\d{2}$'
      and jsonb_typeof(result_details->'disqualification'->'note') = 'string'
    )
  )
);
