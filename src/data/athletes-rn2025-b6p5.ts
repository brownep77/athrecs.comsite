import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[604,"894","Graham","Horne","M","M40","45:04","unattached","Unattached","Not supplied",null,null,"graham-horne"],
[605,"402","Dan","Goodwin","M","M45","45:08","unattached","Unattached","Not supplied",null,null,"dan-goodwin"],
[606,"1364","Brandon","Woodhouse","M","MO","44:53","unattached","Unattached","Not supplied",null,null,"brandon-woodhouse"],
[607,"1539","Jack","Bye","M","MO","44:54","unattached","Unattached","Not supplied",null,null,"jack-bye"],
[608,"607","Christopher","Noller","M","M50","45:12","tri-anglia","Tri-Anglia Triathlon Club","Norfolk","Norfolk","England","christopher-noller"],
[609,"480","Will","Waddingham","M","MO","44:33","unattached","Unattached","Not supplied",null,null,"will-waddingham"],
[610,"365","Charlie","Huggett","M","MO","44:16","unattached","Unattached","Not supplied",null,null,"charlie-huggett"],
[611,"734","Rebecca","Main","F","F40","44:38","unattached","Unattached","Not supplied",null,null,"rebecca-main"],
[612,"863","Jake","Kerr","M","MO","45:02","unattached","Unattached","Not supplied",null,null,"jake-kerr"],
[613,"873","Adam","Wright","M","MO","45:13","unattached","Unattached","Not supplied",null,null,"adam-wright"],
[614,"1507","Simon","Elliott","M","MO","45:28","unattached","Unattached","Not supplied",null,null,"simon-elliott"],
[615,"781","Jack","Dring","M","MO","44:02","unattached","Unattached","Not supplied",null,null,"jack-dring"],
[616,"842","Alex","Day","M","MO","44:39","unattached","Unattached","Not supplied",null,null,"alex-day"],
[617,"1084","Jacob","Calvo Penfold","M","MO","44:31","unattached","Unattached","Not supplied",null,null,"jacob-calvo-penfold"],
[618,"931","Luke","Fish","M","MO","44:59","unattached","Unattached","Not supplied",null,null,"luke-fish"],
[619,"159","Ben","Nockolds","M","MO","45:18","unattached","Unattached","Not supplied",null,null,"ben-nockolds"],
[620,"1059","Will","Moy","M","MO","44:52","unattached","Unattached","Not supplied",null,null,"will-moy"],
[621,"112","Michael","Wilce","M","MO","44:48","unattached","Unattached","Not supplied",null,null,"michael-wilce"],
[622,"914","Shannon","Brown","F","FO","45:09","unattached","Unattached","Not supplied",null,null,"shannon-brown"],
[623,"1494","Ella","Woodcock","F","FO","45:16","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","ella-woodcock"],
[624,"1385","Ben","Miller","M","MO","44:35","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","ben-miller"],
[625,"1596","Harry","Cowper Johnson","M","MO","45:01","unattached","Unattached","Not supplied",null,null,"harry-cowper-johnson"],
[626,"1203","Ewan","Gallagher","M","MO","44:33","unattached","Unattached","Not supplied",null,null,"ewan-gallagher"],
[627,"1359","Ian","Brown","M","M55","45:38","unattached","Unattached","Not supplied",null,null,"ian-brown"],
[628,"1150","Matthew","Parkes","M","MO","45:37","unattached","Unattached","Not supplied",null,null,"matthew-parkes"]
];
export const athletesRn2025B6P5: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
