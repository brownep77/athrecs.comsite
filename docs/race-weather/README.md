# Race-day weather

Weather is shared by event slug and exact edition date. It does not establish
participation or alter results, verification, visibility, PBs or achievements.
The collection covers 75 existing dated editions. The 26 October 2026 gap review
recovered Cebu on 9 January 2011 using 23 airport observation hours. All 75 now
have temperature, wind and humidity; 70 have condition codes, and five have
cloud-cover information only. Peak gusts are available for 59 editions.

The original 32 complete precipitation summaries are unchanged. The other 43
have a separately stored and explicitly labelled NASA POWER regional model
estimate. These are **not recovered rain-gauge observations**.

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

## Gap review and supplemental sources

- Archived METAR reports from Iowa Environmental Mesonet (Iowa State University)
  add 14 condition summaries and nine peak gusts. `supplements.json` records
  reviewed airport identifiers and coordinates from NOAA's station inventory.
  Cebu uses RPVM, not the obsolete/misassigned RPMT identifier in the original
  Meteostat metadata. Östersund's reviewed identifier is ESNZ; its older ESPC
  query returned no reports. No athlete or result identity is inferred.
- METAR UTC timestamps are filtered independently to the local calendar day.
  One observation per UTC hour is used for Cebu's temperature/wind/humidity;
  special reports cannot inflate hourly coverage. Conditions and gusts use all
  distinct reports within the day. Missing sky codes, CAVOK and vicinity-only
  phenomena are not interpreted as clear/dry or as weather at the station.
  The archive has limited quality control. Raw query URLs, hashes, report counts,
  station identity and the supplemented fields remain in the snapshot.
- Helsinki 2019, Brussels 2009, Stockholm 2008, Great Bentley 2008 and Östersund
  2007 retain no usable present-weather codes in the reviewed archives. Existing
  Meteostat hourly cloud-cover values recover a limited sky description, clearly
  distinguished from rain/fog/other conditions. No clear/dry condition is inferred.
- NASA POWER `PRECTOTCORR` supplies hourly MERRA-2 precipitation in mm/hour. We
  explicitly request UTC and sum exactly the hours of the race's civil local
  date, including 23/25-hour DST days. Missing/negative/fill values prevent a
  complete estimate. Nonzero traces rounded below 0.1 mm are not shown as zero.
  The 0.5° × 0.625° model represents a broad region around the existing station,
  not the course or a rain gauge. It cannot establish rain during the race.
  Estimates do not overwrite `precipitationMm`, its hourly coverage or condition
  codes. Full response hashes, coordinates, time standard and source are retained.
- Meteostat daily archives were also inspected for all 46 editions with missing
  precipitation or gusts. Fourteen of the 43 missing totals had daily values, but their
  reporting periods were not established as the race's midnight-to-midnight
  local day. They were not substituted into that field. NOAA GSOD documentation
  likewise warns that reporting periods can include the previous day; no GSOD
  values are published. Sixteen gust values remain unavailable: absence of a
  reported gust is not evidence of a zero gust or a measured daily maximum.
- Supplement requests run offline, sequentially with caching. No new profile
  requests, database queries, credentials or paid API dependency are introduced.

## Reproduce

```sh
python scripts/collect-race-weather.py docs/race-weather/editions.json src/data/race-day-weather.json /tmp/athrecs-weather-cache
python scripts/supplement-race-weather.py src/data/race-day-weather.json docs/race-weather/supplements.json /tmp/athrecs-weather-cache
python scripts/verify-race-weather.py
node scripts/verify-race-weather.mjs
```

The manifest and snapshots contain event/weather facts only, without athlete
identifiers or performance exports. Refresh collection in a reviewed change;
never collect automatically from the profile rendering path.

## Licence

Meteostat and its data providers, CC BY 4.0. AthRecs aggregates and rounds the
redistributed data. Attribution links remain in each weather disclosure.
IEM describes its materials as public domain; its archive is credited where used.
NASA POWER data are available without use restrictions and credited under its
published CC BY 4.0 terms. AthRecs sums and rounds the hourly estimates.

- https://dev.meteostat.net/data/timeseries/hourly
- https://dev.meteostat.net/data/weather-stations
- https://dev.meteostat.net/formats
- https://dev.meteostat.net/providers
- https://dev.meteostat.net/license
- https://creativecommons.org/licenses/by/4.0/
- https://mesonet.agron.iastate.edu/request/download.phtml
- https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?help=
- https://mesonet.agron.iastate.edu/disclaimer.php
- https://www.ncei.noaa.gov/pub/data/noaa/isd-history.csv
- https://power.larc.nasa.gov/docs/services/api/temporal/hourly/
- https://power.larc.nasa.gov/docs/faqs/other/
- https://power.larc.nasa.gov/docs/methodology/meteorology/precipitation/
- https://registry.opendata.aws/nasa-power/
