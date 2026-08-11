import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[655,"594","Vickie","Hallam","F","F45","45:34","unattached","Unattached","Not supplied",null,null,"vickie-hallam"],
[656,"928","Aj","Johnson","M","MO","45:13","unattached","Unattached","Not supplied",null,null,"aj-johnson"],
[657,"1129","Matthew","Wardle","M","MO","45:27","unattached","Unattached","Not supplied",null,null,"matthew-wardle"],
[658,"881","Aidan","Overton","M","MO","45:41","unattached","Unattached","Not supplied",null,null,"aidan-overton"],
[659,"143","Joe","Prendergast","M","MO","44:58","unattached","Unattached","Not supplied",null,null,"joe-prendergast"],
[660,"1553","Joe","Palmer","M","M45","45:20","unattached","Unattached","Not supplied",null,null,"joe-palmer"],
[661,"1178","Mark","Robbins","M","M40","45:33","unattached","Kenilworth Runners","Not supplied",null,null,"mark-robbins"],
[662,"1433","Declan","Nicol","M","MO","45:18","unattached","Unattached","Not supplied",null,null,"declan-nicol"],
[663,"1164","Samuel","Sadd","M","MO","44:50","unattached","Unattached","Not supplied",null,null,"samuel-sadd"],
[664,"921","Alex","Curl","M","MO","45:33","unattached","Unattached","Not supplied",null,null,"alex-curl"],
[665,"2870","Jason","Reynolds","M","MO","42:52","unattached","Unattached","Not supplied",null,null,"jason-reynolds"],
[666,"1325","Ian","Carrell","M","M55","45:42","unattached","Unattached","Not supplied",null,null,"ian-carrell"],
[667,"925","Patrick","Dickinson","M","MO","44:55","unattached","Unattached","Not supplied",null,null,"patrick-dickinson"],
[668,"422","Tom","Walters","M","MO","45:39","unattached","Unattached","Not supplied",null,null,"tom-walters"],
[669,"604","Mark","Ogden","M","M50","44:53","unattached","Unattached","Not supplied",null,null,"mark-ogden"],
[670,"509","David","Grealy","M","MO","45:32","unattached","Hyde Park Harriers","Not supplied",null,null,"david-grealy"],
[671,"1194","Michael","Fleckney","M","MO","45:22","unattached","Unattached","Not supplied",null,null,"michael-fleckney"],
[672,"564","George","Chesney","M","MO","45:29","unattached","Unattached","Not supplied",null,null,"george-chesney"],
[673,"1471","Richard","Huggins","M","M45","44:57","unattached","Unattached","Not supplied",null,null,"richard-huggins"],
[674,"1746","Georgie","Paganini","F","FO","45:14","unattached","Unattached","Not supplied",null,null,"georgie-paganini"],
[675,"1561","Nick","Moore","M","MO","45:27","unattached","Unattached","Not supplied",null,null,"nick-moore"],
[676,"767","Thomas","Payne","M","MO","45:56","unattached","Unattached","Not supplied",null,null,"thomas-payne"],
[677,"541","Chris","Drake","M","MO","45:19","unattached","Unattached","Not supplied",null,null,"chris-drake"],
[678,"679","Daniel","Gardiner","M","M55","45:52","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","daniel-gardiner"],
[679,"1668","Tom","Hall","M","MO","45:06","unattached","Unattached","Not supplied",null,null,"tom-hall"]
];
export const athletesRn2025B6P7: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
