import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[578,"657","Stanley","Hodds","M","MO","45:01","unattached","Unattached","Not supplied",null,null,"stanley-hodds"],
[579,"702","Graham","O'hara","M","M50","45:13","unattached","Unattached","Not supplied",null,null,"graham-ohara"],
[580,"1205","Nathan","Shoesmith","M","MO","45:24","unattached","Manchester Road Runners","Not supplied",null,null,"nathan-shoesmith"],
[581,"739","Paul","Guille","M","MO","45:02","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","paul-guille"],
[582,"1025","Alex","Snow","M","MO","45:03","unattached","Unattached","Not supplied",null,null,"alex-snow"],
[583,"1316","Jake","Stagg","M","MO","44:25","unattached","Dereham Runners AC","Not supplied",null,null,"jake-stagg"],
[584,"783","Ben","Moore","M","MO","45:06","unattached","Unattached","Not supplied",null,null,"ben-moore"],
[585,"1372","Stephen","Aspery","M","MO","43:50","unattached","Unattached","Not supplied",null,null,"stephen-aspery"],
[586,"1437","Conor","Saunders","M","MO","44:03","unattached","Unattached","Not supplied",null,null,"conor-saunders"],
[587,"1186","Mark","Appleton","M","MO","44:40","unattached","Zoom Tri Club Bournemouth","Not supplied",null,null,"mark-appleton"],
[588,"599","Sam","Webb","M","MO","45:07","unattached","Unattached","Not supplied",null,null,"sam-webb"],
[589,"368","Liam","Quadling","M","MO","45:07","unattached","Unattached","Not supplied",null,null,"liam-quadling"],
[590,"1039","Oliver","Forkes","M","MO","44:48","unattached","Unattached","Not supplied",null,null,"oliver-forkes"],
[591,"1652","Olly","Farrow","M","M40","45:01","unattached","Norfolk Harriers RC","Not supplied",null,null,"olly-farrow"],
[592,"1094","Rob","Mcvicar","M","M45","45:00","unattached","Unattached","Not supplied",null,null,"rob-mcvicar"],
[593,"1850","Jon","Rowden","M","M55","44:00","tri-anglia","Tri-Anglia Triathlon Club","Norfolk","Norfolk","England","jon-rowden"],
[594,"513","Sebastian","Polomski","M","M40","44:46","unattached","Unattached","Not supplied",null,null,"sebastian-polomski"],
[595,"1821","James","Byrne","M","MO","44:11","unattached","Unattached","Not supplied",null,null,"james-byrne"],
[596,"1013","James","Boulton","M","MO","44:53","unattached","Unattached","Not supplied",null,null,"james-boulton"],
[597,"160","Max","Fisher","M","MO","45:09","unattached","Norfolk Harriers RC","Not supplied",null,null,"max-fisher"],
[599,"904","Josh","Bloyce","M","MO","45:10","unattached","Unattached","Not supplied",null,null,"josh-bloyce"],
[600,"798","Thomas","Galer","M","MO","43:56","unattached","Unattached","Not supplied",null,null,"thomas-galer"],
[601,"1423","Timothy","Bishop","M","M55","45:05","unattached","Unattached","Not supplied",null,null,"timothy-bishop"],
[602,"646","George","Crane","M","MO","44:52","unattached","Unattached","Not supplied",null,null,"george-crane"],
[603,"609","Will","Johnson","M","M45","44:41","unattached","Unattached","Not supplied",null,null,"will-johnson"]
];
export const athletesRn2025B6P4: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
