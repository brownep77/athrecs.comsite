import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[501,"1090","Robert","Groves","M","MO","44:20","reepham-runners","Reepham Runners","Norfolk","Norfolk","England","robert-groves"],
[502,"927","Freddie","Henley-hunter","M","MO","43:59","unattached","Unattached","Not supplied",null,null,"freddie-henley-hunter"],
[503,"998","Toby","Blyth","M","MO","43:55","unattached","Unattached","Not supplied",null,null,"toby-blyth"],
[504,"477","Gary","Grand","M","M60","44:25","unattached","Unattached","Not supplied",null,null,"gary-grand"],
[505,"1506","Olly","Huggett","M","MO","44:23","unattached","Unattached","Not supplied",null,null,"olly-huggett"],
[506,"312","Zac","Sowter","M","MO","43:47","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","zac-sowter"],
[507,"1806","Alastair","Drew","M","M40","44:39","unattached","Unattached","Not supplied",null,null,"alastair-drew"],
[508,"142","Jack","Fussey","M","MO","44:48","unattached","Unattached","Not supplied",null,null,"jack-fussey"],
[509,"1115","Jack","Jillings","M","MO","42:55","unattached","Unattached","Not supplied",null,null,"jack-jillings"],
[510,"602","Joanne","Watkins","F","F40","44:40","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","joanne-watkins"],
[511,"980","Daryl","Aldous","M","M40","43:55","unattached","Unattached","Not supplied",null,null,"daryl-aldous"],
[512,"1093","Darren","Moore","M","M50","44:06","unattached","Unattached","Not supplied",null,null,"darren-moore"],
[513,"703","Brendan","Edwards","M","MO","44:22","unattached","Unattached","Not supplied",null,null,"brendan-edwards"],
[514,"315","Rob","Riley","M","MO","44:15","unattached","Defra AC","Not supplied",null,null,"rob-riley"],
[515,"1674","Matthew","Cozens","M","M40","43:45","unattached","Unattached","Not supplied",null,null,"matthew-cozens"],
[516,"370","Karl","Coulson","M","M55","44:16","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","karl-coulson"],
[517,"619","Stuart","Clark","M","MO","44:29","unattached","Unattached","Not supplied",null,null,"stuart-clark"],
[518,"831","Richard","Palmer","M","M40","44:19","unattached","Unattached","Not supplied",null,null,"richard-palmer"],
[519,"1637","Dan","Deag","M","MO","44:27","unattached","Unattached","Not supplied",null,null,"dan-deag"],
[520,"1111","Tom","Allenby","M","MO","44:01","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","tom-allenby"],
[521,"806","Matthew","Pask","M","M55","44:25","unattached","Unattached","Not supplied",null,null,"matthew-pask"],
[522,"526","Lewis","Wilkins","M","MO","44:27","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","lewis-wilkins"],
[523,"1200","Michael","Brouse","M","M40","44:21","unattached","Zoom Tri Club Bournemouth","Not supplied",null,null,"michael-brouse"],
[524,"1367","Neil","Dobson","M","M40","44:32","unattached","Unattached","Not supplied",null,null,"neil-dobson"],
[526,"1036","Keane","Pye","M","MO","44:16","unattached","Unattached","Not supplied",null,null,"keane-pye"]
];
export const athletesRn2025B6P1: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
