import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[629,"318","Zlatin","Milanov","M","MO","45:09","unattached","Unattached","Not supplied",null,null,"zlatin-milanov"],
[630,"499","Daniel","Stocks","M","MO","44:35","unattached","Saint Edmund Pacers","Not supplied",null,null,"daniel-stocks"],
[631,"334","James","Smith","M","MO","44:25","unattached","Unattached","Not supplied",null,null,"james-smith"],
[632,"475","Annie","Draper","F","FO","45:47","unattached","Unattached","Not supplied",null,null,"annie-draper"],
[633,"832","Jack","Webb","M","MO","44:42","unattached","Unattached","Not supplied",null,null,"jack-webb"],
[635,"833","George","Smy","M","MO","44:21","unattached","Unattached","Not supplied",null,null,"george-smy"],
[636,"974","Chloe","Ward","F","FO","44:26","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","chloe-ward"],
[637,"1659","Clive","Parkerson","M","M50","45:18","unattached","Unattached","Not supplied",null,null,"clive-parkerson"],
[638,"968","Brett","Colclough","M","MO","45:38","unattached","Unattached","Not supplied",null,null,"brett-colclough"],
[639,"463","Alan","Kyle","M","M40","44:58","unattached","Unattached","Not supplied",null,null,"alan-kyle"],
[640,"1213","Milly","Chalcraft","F","FO","45:05","unattached","Unattached","Not supplied",null,null,"milly-chalcraft"],
[641,"1092","Neil","Park","M","M45","44:29","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","neil-park"],
[642,"583","Liam","Killington","M","MO","44:56","unattached","Unattached","Not supplied",null,null,"liam-killington"],
[643,"551","Becky","Willett","F","FO","45:33","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","becky-willett"],
[644,"528","Steve","Ely","M","M50","45:16","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","steve-ely"],
[645,"892","Chris","Ashling","M","M45","45:34","unattached","Unattached","Not supplied",null,null,"chris-ashling"],
[646,"804","Andrew","Buck","M","M45","44:54","unattached","Unattached","Not supplied",null,null,"andrew-buck"],
[647,"699","James","Vaughan","M","MO","45:14","unattached","Unattached","Not supplied",null,null,"james-vaughan"],
[648,"440","Joshua","Brett","M","MO","45:14","unattached","Unattached","Not supplied",null,null,"joshua-brett"],
[649,"1503","Bryn","Harrison","M","MO","44:43","unattached","Unattached","Not supplied",null,null,"bryn-harrison"],
[650,"1308","Dean","Fiske","M","M40","45:26","unattached","Unattached","Not supplied",null,null,"dean-fiske"],
[651,"692","Jack","Keeble","M","MO","45:37","unattached","Unattached","Not supplied",null,null,"jack-keeble"],
[652,"1373","Matthew","Boulter","M","MO","44:18","unattached","Unattached","Not supplied",null,null,"matthew-boulter"],
[653,"1226","Scott","Bemment","M","M50","45:28","unattached","Clapham Chasers","Not supplied",null,null,"scott-bemment"],
[654,"518","James","Bowman","M","MO","45:12","unattached","Unattached","Not supplied",null,null,"james-bowman"]
];
export const athletesRn2025B6P6: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
