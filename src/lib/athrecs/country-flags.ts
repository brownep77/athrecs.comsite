const codes =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
const names = new Intl.DisplayNames(["en-GB"], { type: "region" });
const regions = new Map(
  codes.flatMap((code) => [
    [code.toLowerCase(), code],
    [(names.of(code) ?? code).toLowerCase(), code],
  ]),
);
const aliases: Record<string, string> = {
  uk: "GB",
  gbr: "GB",
  "great britain": "GB",
  british: "GB",
  "united kingdom": "GB",
  usa: "US",
  "united states of america": "US",
  "u.s.a.": "US",
  uae: "AE",
  "republic of ireland": "IE",
  irish: "IE",
  "czech republic": "CZ",
  "south korea": "KR",
  "north korea": "KP",
  turkey: "TR",
  "the netherlands": "NL",
};
export function countryFlag(value: string | null | undefined) {
  const original = value?.trim() ?? "";
  const key = original.toLowerCase();
  const home = (
    {
      england: "England",
      english: "England",
      scotland: "Scotland",
      scottish: "Scotland",
      wales: "Wales",
      welsh: "Wales",
      "northern ireland": "Northern Ireland",
    } as Record<string, string>
  )[key];
  if (home)
    return {
      code:
        home === "England"
          ? "GB-ENG"
          : home === "Scotland"
            ? "GB-SCT"
            : home === "Wales"
              ? "GB-WLS"
              : "GB",
      name: home,
      emoji: "🇬🇧",
    };
  const code = aliases[key] ?? regions.get(key);
  return {
    code: code ?? "",
    name: code ? (names.of(code) ?? original) : original,
    emoji: code
      ? String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + 127397))
      : "",
  };
}
