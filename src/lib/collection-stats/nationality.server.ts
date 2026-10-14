// SQL equivalents of the explicit observations read by readSourceNationality.
// Residence, club, birth country and competition location are never fallbacks.
const text = (value: string) => `case when jsonb_typeof(${value})='string'
  and length(trim(${value}#>>'{}')) between 1 and 100
  and trim(${value}#>>'{}') !~* '^(unknown|unspecified|n/?a|none|null|u|[-?]+)$'
  then trim(${value}#>>'{}') end`;

function observation(value: string, provider: string, url: string) {
  return `case when length(trim(coalesce(${provider},''))) between 1 and 160
    and length(coalesce(${url},''))<=2000
    and ${url} ~* '^https?://[^/@[:space:]]+([/?#]|$)'
    then ${text(value)} end`;
}

/** Column expressions are internal constants, never user input. */
export function sourceNationalitySql(details: string): string {
  const supplied = `${details}->'sourceNationalityObservation'`;
  const wmm = `${details}->'worldMarathonMajors'`;
  const archive = `${details}->'archiveCreation'`;
  return `case
    when jsonb_typeof(${supplied})='object' and ${supplied}<>'{}'::jsonb
      then ${observation(`${supplied}->'value'`, `${supplied}->>'provider'`, `${supplied}->>'sourceUrl'`)}
    when ${archive}->'sourceRowsCompared'='true'::jsonb
      and ${archive}->>'candidateId'=${wmm}->>'athleteId'
      and ${wmm}->>'athleteId' ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      and ${wmm}->>'sourceUrl'='https://www.worldmarathonmajors.com/rankings/world-rankings'
      then ${text(`${wmm}->'nationality'`)}
    when exists(select 1 from jsonb_array_elements(case
      when jsonb_typeof(${details}->'sourceIdentities')='array' then ${details}->'sourceIdentities'
      else '[]'::jsonb end) identity
      where identity->>'sourceUrl' ~ '^https://statistik[.]d-u-v[.]org/getresultperson[.]php[?]runner=[0-9]+$'
        and identity->>'externalId'=substring(identity->>'sourceUrl' from 'runner=([0-9]+)$'))
      then ${text(`${details}#>'{duvSourceObservation,nationality}'`)}
    end`;
}

export const statedNationalitySql = text("a.profile_details->'nationality'");
