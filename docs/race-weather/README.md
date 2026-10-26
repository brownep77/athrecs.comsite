# Race-day weather

Weather is shared by event slug and exact edition date. It does not establish
participation or alter results, verification, visibility, PBs or achievements.
The initial collection covers 75 existing dated editions: 74 have sufficient
hourly temperature coverage; Cebu on 9 January 2011 is unavailable.

The profile shows a short disclosure below each race name, inside the existing
column. The disclosure contains wind, humidity, precipitation, station identity,
coverage, source quality and licence attribution. It is keyboard accessible and
works without JavaScript. No weather requests or extra database queries occur
when a profile is viewed.

## Method and limits

- Source: Meteostat's redistributed station/year hourly archives, retrieved
  26 October 2026. Station metadata comes from its documented JSON endpoint.
- UTC hours are selected by the race's IANA local time zone, including 23/25-hour
  daylight-saving days and UTC year boundaries.
- No start times are inferred or used. These are calendar-day summaries,
  including overnight weather, not conditions during the athlete's race.
- Min/max are extrema of available hourly temperatures, not continuous daily
  extrema. At least 75% of the expected hours must contain a temperature.
- Wind/humidity means use available hours. Precipitation totals are shown only
  with every expected hourly value; missing values are never zero-filled.
- The condition summary reports significant conditions occurring at any time
  in the day. Absence of a condition code never means clear or dry.
- The manifest uses regional stations, not on-course instruments. Coastal and
  hilly routes may differ materially. Cromer's Norfolk Marathon uses the Norwich
  regional station; it is explicitly labelled Cromer in the weather disclosure.
  Its location was checked at https://totalracetiming.co.uk/raceresults/525.
- Source IDs are retained. `dwd_mosmix` and `metno_forecast` values are explicitly
  labelled as including model estimates. Archives retain URL and SHA-256 digest.
- Failed archives and inadequate coverage remain unavailable. Nearby alternatives
  are reviewed in the manifest; no automatic long-distance fallback is performed.

## Reproduce

```sh
python scripts/collect-race-weather.py docs/race-weather/editions.json src/data/race-day-weather.json /tmp/athrecs-weather-cache
python scripts/verify-race-weather.py
node scripts/verify-race-weather.mjs
```

The manifest and snapshots contain event/weather facts only, without athlete
identifiers or performance exports. Refresh collection in a reviewed change;
never collect automatically from the profile rendering path.

## Licence

Meteostat and its data providers, CC BY 4.0. AthRecs aggregates and rounds the
redistributed data. Attribution links remain in each weather disclosure.

- https://dev.meteostat.net/data/timeseries/hourly
- https://dev.meteostat.net/data/weather-stations
- https://dev.meteostat.net/formats
- https://dev.meteostat.net/providers
- https://dev.meteostat.net/license
- https://creativecommons.org/licenses/by/4.0/
