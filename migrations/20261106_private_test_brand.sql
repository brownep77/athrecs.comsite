-- Private demonstration brand for showing local shops the brand dashboard.
-- Test brands belong only to the approved test account (athrecs_is_test_user),
-- never appear in public listings and cannot receive applications from real accounts.

alter table partner_brands add column if not exists synthetic_test boolean not null default false;

create or replace function guard_partner_test_brand() returns trigger language plpgsql as $$
begin
  if athrecs_is_test_user(new.owner_user_id) then
    -- Anything the test account registers stays private.
    new.synthetic_test := true;
  elsif new.synthetic_test then
    raise exception 'Private test brands are restricted to the approved test account';
  end if;
  return new;
end $$;

drop trigger if exists guard_partner_test_brand on partner_brands;
create trigger guard_partner_test_brand before insert or update on partner_brands
  for each row execute function guard_partner_test_brand();

-- Paul's Norfolk Test Shop, owned by the approved test account. Fictional company;
-- the .example domain is reserved and resolves nowhere.
insert into partner_brands
  (owner_user_id, name, website, website_host, category, description, sports, markets,
   contact_name, contact_role, status, review_note, reviewed_at, synthetic_test)
select t.user_id, 'Paul''s Norfolk Test Shop', 'https://pauls-norfolk-test-shop.example',
  'pauls-norfolk-test-shop.example', 'sportswear',
  'A fictional independent running shop in Norwich, used to demonstrate the AthRecs brand dashboard to local retailers. Not a real business.',
  'Running, triathlon, parkrun', 'Norwich and Norfolk, UK', 'Paul Browne', 'Owner (demo)',
  'approved', 'Private test company: never shown on the public website.', now(), true
from athrecs_test_athletes t
where t.user_id is not null
  and not exists (select 1 from partner_brands b where b.owner_user_id = t.user_id)
order by t.created_at
limit 1;

insert into partner_opportunities
  (brand_id, title, kind, audience, description, benefits, requirements, sports, markets,
   closing_date, status, reviewed_at)
select b.id, o.title, o.kind, o.audience, o.description, o.benefits, o.requirements,
  o.sports, o.markets, current_date + o.days, 'approved', now()
from partner_brands b
cross join (values
  ('15% off running shoes for AthRecs athletes', 'discount', 'athletes',
   'Show your AthRecs profile in store to get 15% off full-price running shoes, plus a free gait analysis with our fitting team.',
   '15% off full-price running shoes and a free gait analysis.',
   'A claimed AthRecs athlete profile. One use per visit.', 'Running', 'Norwich and Norfolk, UK', 90),
  ('Shop ambassador: Norfolk runners wanted', 'ambassador', 'athletes',
   'We are looking for three local runners to represent the shop at Norfolk races this season, test new kit and share honest reviews with our customers.',
   'Free kit each quarter, 25% staff discount and race entry support.',
   'Racing regularly in Norfolk with results on AthRecs. Aged 18 or over.', 'Running, triathlon', 'Norfolk, UK', 60),
  ('Club kit partnership for Norfolk running clubs', 'club_partnership', 'clubs',
   'Partner with us for your club vests and training kit. We offer bulk pricing, a club night in store and a branded club page.',
   'Bulk club pricing, a members'' discount code and an annual club night.',
   'An affiliated running club based in Norfolk.', 'Running', 'Norfolk, UK', 120)
) as o(title, kind, audience, description, benefits, requirements, sports, markets, days)
where b.synthetic_test and b.name = 'Paul''s Norfolk Test Shop'
  and not exists (select 1 from partner_opportunities x where x.brand_id = b.id);
