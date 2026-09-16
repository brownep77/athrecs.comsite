-- Apply only AFTER the compact profile UI and migration 0033 are live.
-- Paul requested a live public profile in this task. All other source profiles
-- keep their existing visibility. His birthday remains hidden.
update athletes set profile_visibility='public'
where slug='paul-browne';
update results set result_visibility='public'
where athlete_id in (select id from athletes where slug='paul-browne');

-- If Paul has already claimed his source identity, publish the unified account
-- and preserve its existing share URL, so account privacy controls remain authoritative.
insert into athlete_public_shares (
  user_id, slug, enabled, share_bio, share_results, share_club, share_location,
  acknowledged_at, published_at, updated_at
)
select l.user_id, 'paul-browne-' || substr(md5(l.user_id),1,8), true,
  true, true, true, true, now(), now(), now()
from athlete_account_links l join athletes a on a.id=l.athlete_id
join athlete_private_profiles p on p.user_id=l.user_id
where l.status='active' and a.slug='paul-browne'
on conflict(user_id) do update set
  enabled=true, acknowledged_at=now(), published_at=coalesce(athlete_public_shares.published_at,now()),
  unpublished_at=null, updated_at=now();
