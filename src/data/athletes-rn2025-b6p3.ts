import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[552,"419","Richard","Nobes","M","M40","44:52","unattached","Unattached","Not supplied",null,null,"richard-nobes"],
[553,"172","Richard","Turner","M","M40","44:12","unattached","Unattached","Not supplied",null,null,"richard-turner"],
[554,"780","Kierran","Haynes","M","MO","44:22","unattached","Unattached","Not supplied",null,null,"kierran-haynes"],
[555,"786","Jacob","Last","M","MO","44:51","unattached","Dereham Runners AC","Not supplied",null,null,"jacob-last"],
[556,"457","Vashti","Macdonald-clink","F","F45","44:49","unattached","Cambridge & Coleridge AC","Not supplied",null,null,"vashti-macdonald-clink"],
[557,"797","Harly","Moon","F","FO","44:29","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","harly-moon"],
[558,"1275","Jonathan","Gale","M","MO","45:20","unattached","Aylsham Runners","Not supplied",null,null,"jonathan-gale"],
[559,"774","Tom","Askew","M","M40","44:19","unattached","Unattached","Not supplied",null,null,"tom-askew"],
[561,"310","Ian","Callaghan","M","M50","44:26","unattached","Unattached","Not supplied",null,null,"ian-callaghan"],
[562,"346","Shane","Hall","M","MO","44:49","unattached","Unattached","Not supplied",null,null,"shane-hall"],
[563,"178","Cormac","O'driscoll","M","MO","44:40","unattached","Unattached","Not supplied",null,null,"cormac-odriscoll"],
[564,"635","Nathan","West","M","MO","45:01","unattached","Unattached","Not supplied",null,null,"nathan-west"],
[565,"1199","Toby","Elsom","M","MO","44:15","unattached","Unattached","Not supplied",null,null,"toby-elsom"],
[566,"1198","Alastair","Elsom","M","MO","44:15","unattached","Unattached","Not supplied",null,null,"alastair-elsom"],
[567,"1140","Lewis","Batch","M","MO","44:25","unattached","Unattached","Not supplied",null,null,"lewis-batch"],
[568,"994","David","Asker","M","M40","44:26","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","david-asker"],
[569,"152","David","Tayler","M","MO","44:56","unattached","Unattached","Not supplied",null,null,"david-tayler"],
[570,"1087","Adam","Bevington","M","M40","44:28","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","adam-bevington"],
[571,"1268","Paul","Wheeler","M","M40","45:04","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","paul-wheeler"],
[572,"470","Jack","Blandy","M","MO","44:42","unattached","Unattached","Not supplied",null,null,"jack-blandy"],
[573,"164","Wayne","Ramsbottom","M","M55","44:49","unattached","Dereham Runners AC","Not supplied",null,null,"wayne-ramsbottom"],
[574,"1196","Shane","West","M","MO","45:05","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","shane-west"],
[575,"1015","David","Wright","M","M40","44:49","unattached","Unattached","Not supplied",null,null,"david-wright"],
[576,"799","Carl","Fairbrother","M","MO","44:02","unattached","Mansfield Harriers","Not supplied",null,null,"carl-fairbrother"],
[577,"723","Dean","Howard","M","M50","44:49","north-norfolk-beach-runners","North Norfolk Beach Runners","Norfolk","Norfolk","England","dean-howard"]
];
export const athletesRn2025B6P3: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
