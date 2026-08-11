import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[701,"1103","Julia","Parsley","F","F40","45:58","unattached","Unattached","Not supplied",null,null,"julia-parsley"],
[702,"1632","Ian","Beggs","M","M55","45:58","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","ian-beggs"],
[703,"940","Craig","Rush","M","MO","45:53","unattached","Unattached","Not supplied",null,null,"craig-rush"],
[704,"1095","Marek","Zdan","M","M40","45:52","unattached","Unattached","Not supplied",null,null,"marek-zdan"],
[705,"1079","Tom","Nichols","M","M40","46:06","unattached","Unattached","Not supplied",null,null,"tom-nichols"],
[706,"1305","Catherine","Henery","F","F60","45:51","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","catherine-henery"],
[707,"905","Ben","Edwards","M","MO","45:31","unattached","Unattached","Not supplied",null,null,"ben-edwards"],
[708,"725","Matthew","Trollope","M","M45","46:03","unattached","Lonely Goat RC","Not supplied",null,null,"matthew-trollope"],
[709,"590","Luke","Bailey","M","MO","45:41","unattached","Unattached","Not supplied",null,null,"luke-bailey"],
[710,"883","Richard","Strange","M","MO","45:29","unattached","Unattached","Not supplied",null,null,"richard-strange"],
[711,"411","Laura","George","F","FO","46:20","unattached","Aylsham Runners","Not supplied",null,null,"laura-george"],
[712,"307","Tom","West","M","MO","45:33","unattached","Unattached","Not supplied",null,null,"tom-west"],
[713,"405","Sam","Ireland","M","MO","45:52","unattached","Unattached","Not supplied",null,null,"sam-ireland"],
[714,"1266","Helen","Harper-lambert","F","FO","45:58","unattached","Unattached","Not supplied",null,null,"helen-harper-lambert"],
[715,"829","Robyn","Macrae","F","FO","46:10","unattached","Unattached","Not supplied",null,null,"robyn-macrae"],
[716,"4325","Amelia","Balding","F","FO","39:19","unattached","Unattached","Not supplied",null,null,"amelia-balding"],
[717,"1021","Stuart","Thompson","M","M50","45:49","unattached","Unattached","Not supplied",null,null,"stuart-thompson"],
[718,"194","Lee","Wilson","M","M50","46:17","unattached","Unattached","Not supplied",null,null,"lee-wilson"],
[719,"1067","Jack","Lovick","M","MO","46:25","unattached","Unattached","Not supplied",null,null,"jack-lovick"],
[720,"830","Richard","Stanley","M","M40","46:15","unattached","Unattached","Not supplied",null,null,"richard-stanley"],
[721,"7040","Ian","Stubbs","M","M50","45:46","unattached","Unattached","Not supplied",null,null,"ian-stubbs"],
[722,"429","Paul","Williams","M","M55","46:25","unattached","Unattached","Not supplied",null,null,"paul-williams"],
[723,"1684","Lawrence","Cooke","M","M40","46:37","unattached","Harleston Running Club","Not supplied",null,null,"lawrence-cooke"],
[724,"616","Harry","Ward","M","MO","45:56","unattached","Unattached","Not supplied",null,null,"harry-ward"],
[725,"769","Glenn","Orford","M","M55","46:10","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","glenn-orford"]
];
export const athletesRn2025B7P1: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
