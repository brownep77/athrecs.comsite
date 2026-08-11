import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[777,"2714","Sam","Dack","M","MO","43:55","unattached","Unattached","Not supplied",null,null,"sam-dack"],
[778,"855","Ben","Burgess","M","M40","46:40","unattached","Unattached","Not supplied",null,null,"ben-burgess"],
[779,"1430","John","Lee","M","MO","45:49","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","john-lee"],
[780,"141","Vincent","Willard","M","MO","45:35","unattached","Unattached","Not supplied",null,null,"vincent-willard"],
[781,"425","Christopher","Cann","M","MO","46:19","ryston-runners","Ryston Runners","Norfolk","Norfolk","England","christopher-cann"],
[782,"1143","Georgia","Dale","F","FO","46:34","unattached","Unattached","Not supplied",null,null,"georgia-dale"],
[783,"1148","Simon","Smith","M","M50","46:25","north-norfolk-beach-runners","North Norfolk Beach Runners","Norfolk","Norfolk","England","simon-smith"],
[784,"1638","Aaron","Roberts","M","MO","46:40","unattached","Unattached","Not supplied",null,null,"aaron-roberts"],
[785,"1400","Jamie","Tidswell","M","MO","45:30","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","jamie-tidswell"],
[786,"1180","Paul","Parker","M","M60","46:24","unattached","Unattached","Not supplied",null,null,"paul-parker"],
[787,"1345","Sam","Paterson","M","MO","45:33","unattached","Unattached","Not supplied",null,null,"sam-paterson"],
[788,"840","James","Rhodes","M","MO","46:13","unattached","Unattached","Not supplied",null,null,"james-rhodes"],
[789,"1031","Stuart","Plummer","M","M45","46:04","unattached","Unattached","Not supplied",null,null,"stuart-plummer"],
[790,"1074","Jack","Davies","M","MO","46:31","unattached","Unattached","Not supplied",null,null,"jack-davies"],
[791,"1542","Steve","Costello","M","M55","45:31","unattached","Unattached","Not supplied",null,null,"steve-costello"],
[792,"593","Callum","Boulter","M","MO","46:05","unattached","Unattached","Not supplied",null,null,"callum-boulter"],
[793,"1619","Tomasz","Pendleton","M","MO","46:14","unattached","Unattached","Not supplied",null,null,"tomasz-pendleton"],
[794,"1229","Lilibet","Tayler","F","FO","46:51","unattached","Unattached","Not supplied",null,null,"lilibet-tayler"],
[795,"917","Nick","Ross","M","M55","46:09","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","nick-ross"],
[796,"1238","James","Bygrave","M","MO","46:43","unattached","Unattached","Not supplied",null,null,"james-bygrave"],
[797,"1125","Tom","Durrell","M","MO","46:15","unattached","Unattached","Not supplied",null,null,"tom-durrell"],
[798,"1014","Justin","Pearce","M","M50","46:30","unattached","Unattached","Not supplied",null,null,"justin-pearce"],
[799,"1807","Harry","Livermore","M","MO","45:47","unattached","Unattached","Not supplied",null,null,"harry-livermore"],
[800,"1159","Bethany","Jackson","F","FO","45:29","unattached","Unattached","Not supplied",null,null,"bethany-jackson"],
[801,"1438","Mobolaji","Adekunle","M","MO","45:40","unattached","Unattached","Not supplied",null,null,"mobolaji-adekunle"]
];
export const athletesRn2025B7P4: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
