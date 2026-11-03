// Applies to a results row r and its athlete a in the public edition archive.
export const publicResultVisibilitySql = `(r.result_visibility in ('public', 'public_figure') or a.profile_type = 'Public figure')
  and (a.profile_visibility = 'public' or a.profile_type = 'Public figure'
    or (a.profile_visibility = 'private' and a.parent_athlete_id is null
      and a.profile_details#>>'{nameReview,mode}' = 'results_only'
      and not exists (select 1 from athlete_account_links owner where owner.athlete_id = a.id)))
  and not exists (select 1 from athlete_account_links l
    join athlete_public_shares s on s.user_id = l.user_id
    where l.athlete_id = a.id and l.status = 'active'
      and (s.enabled = false or s.share_results = false))
  and not exists (select 1 from athlete_profile_hidden_results h
    join athlete_account_links l on l.user_id = h.user_id and l.status = 'active'
    where l.athlete_id = a.id and h.result_id = r.id)`;
