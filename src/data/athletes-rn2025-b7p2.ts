import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[726,"228","Kareana","Symonds","F","F40","46:07","unattached","Unattached","Not supplied",null,null,"kareana-symonds"],
[727,"600","Marcus","Westgate","M","M50","45:42","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","marcus-westgate"],
[728,"874","Declan","Smith Howell","M","MO","45:50","unattached","Unattached","Not supplied",null,null,"declan-smith-howell"],
[729,"847","Andrew","Cheshire","M","MO","46:24","unattached","Unattached","Not supplied",null,null,"andrew-cheshire"],
[730,"672","Nicola","Hill","F","F50","46:21","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","nicola-hill"],
[731,"675","Jessica","Smith","F","F40","45:22","unattached","Unattached","Not supplied",null,null,"jessica-smith"],
[732,"1022","Simon","Farrow","M","M50","45:05","unattached","Unattached","Not supplied",null,null,"simon-farrow"],
[734,"866","Leon","Edwards","M","M40","45:32","unattached","Unattached","Not supplied",null,null,"leon-edwards"],
[735,"854","Neil","Boyce","M","M50","46:08","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","neil-boyce"],
[736,"669","Dillon","Alexander","M","MO","45:11","unattached","Unattached","Not supplied",null,null,"dillon-alexander"],
[737,"1331","Dave","Eaves","M","MO","45:52","unattached","Unattached","Not supplied",null,null,"dave-eaves"],
[738,"971","Joshua","Taylor","M","MO","46:12","unattached","Unattached","Not supplied",null,null,"joshua-taylor"],
[739,"668","Lianne","Hunter","F","FO","46:36","unattached","Unattached","Not supplied",null,null,"lianne-hunter"],
[740,"1544","George","Webster","M","MO","45:55","unattached","Unattached","Not supplied",null,null,"george-webster"],
[741,"1155","Andrew","Howes","M","MO","46:41","unattached","7 Hills Harriers","Not supplied",null,null,"andrew-howes"],
[742,"1174","Luke","Horgan","M","MO","45:17","unattached","Unattached","Not supplied",null,null,"luke-horgan"],
[743,"1020","Nicolas","Navarro","M","MO","46:05","unattached","Unattached","Not supplied",null,null,"nicolas-navarro"],
[744,"1211","Ethan","Hutchings","M","MO","45:30","unattached","26.2 Road Runners Club","Not supplied",null,null,"ethan-hutchings"],
[745,"514","Ali","Bridges","M","M40","46:09","unattached","Unattached","Not supplied",null,null,"ali-bridges"],
[746,"1104","Leo","Dudley","M","M40","46:14","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","leo-dudley"],
[747,"853","Olivia","Butler","F","FO","45:29","unattached","Unattached","Not supplied",null,null,"olivia-butler"],
[748,"943","Joe","Morel","M","MO","45:38","unattached","Unattached","Not supplied",null,null,"joe-morel"],
[749,"676","Charlie","Moss","M","MO","46:10","unattached","Unattached","Not supplied",null,null,"charlie-moss"],
[750,"952","Lee","West","M","MO","45:38","north-norfolk-beach-runners","North Norfolk Beach Runners","Norfolk","Norfolk","England","lee-west"],
[751,"302","Freddie","Mowforth","M","MO","45:56","unattached","Unattached","Not supplied",null,null,"freddie-mowforth"]
];
export const athletesRn2025B7P2: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
