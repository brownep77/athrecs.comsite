import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[451,"879","Jason","Scott","M","MO","43:32","unattached","Unattached","Not supplied",null,null,"jason-scott"],
[452,"256","Adam","Brown","M","MO","44:02","unattached","Lowestoft Road Runners","Not supplied",null,null,"adam-brown"],
[453,"592","Ryan","Mcnally","M","MO","43:55","unattached","Unattached","Not supplied",null,null,"ryan-mcnally"],
[454,"216","Alexander","Saint-ablett","M","MO","44:05","unattached","Unattached","Not supplied",null,null,"alexander-saint-ablett"],
[455,"1992","Calum","Burke","M","MO","41:00","unattached","Unattached","Not supplied",null,null,"calum-burke"],
[456,"1362","Ben","Sinar","M","MO","42:44","unattached","Unattached","Not supplied",null,null,"ben-sinar"],
[457,"304","Matthew","Cheung","M","MO","44:07","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","matthew-cheung"],
[458,"376","Oliver","Wilkens","M","M45","43:40","unattached","Unattached","Not supplied",null,null,"oliver-wilkens"],
[459,"523","Paul","Knights","M","M50","44:05","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","paul-knights"],
[460,"184","Daniel","Read","M","MO","43:49","unattached","Aylsham Runners","Not supplied",null,null,"daniel-read"],
[461,"496","Andrew","Battle","M","M40","43:54","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","andrew-battle"],
[462,"715","Andrew","Cornish","M","M55","44:14","unattached","Holland Sports AC","Not supplied",null,null,"andrew-cornish"],
[463,"960","Craig","Davies","M","MO","44:17","unattached","Unattached","Not supplied",null,null,"craig-davies"],
[464,"81","Rowan","Van Tromp","M","MO","44:03","unattached","Unattached","Not supplied",null,null,"rowan-van-tromp"],
[465,"813","Peter","Gostelow","M","M45","43:29","unattached","Unattached","Not supplied",null,null,"peter-gostelow"],
[466,"360","James","Robertson","M","MO","44:10","unattached","Unattached","Not supplied",null,null,"james-robertson"],
[467,"465","Ben","Player","M","M40","44:03","unattached","Unattached","Not supplied",null,null,"ben-player"],
[468,"976","James","Boagey","M","MO","43:44","unattached","Unattached","Not supplied",null,null,"james-boagey"],
[469,"1048","Rowena","Conway","F","FO","43:12","unattached","Unattached","Not supplied",null,null,"rowena-conway"],
[470,"552","Lee","Bartlett","M","MO","43:54","unattached","Unattached","Not supplied",null,null,"lee-bartlett"],
[471,"469","Tim","Connell","M","MO","43:39","unattached","Unattached","Not supplied",null,null,"tim-connell"],
[472,"296","Paul","Cossey","M","MO","43:21","unattached","Unattached","Not supplied",null,null,"paul-cossey"],
[474,"687","Conall","Woolstenholmes","M","MO","44:02","unattached","Unattached","Not supplied",null,null,"conall-woolstenholmes"],
[475,"1429","Alex","Walton","M","M50","43:43","unattached","Unattached","Not supplied",null,null,"alex-walton"],
[476,"1005","Mike","Hawkes","M","MO","44:10","unattached","Unattached","Not supplied",null,null,"mike-hawkes"],
[477,"505","Ciaran","Strike","M","MO","44:21","unattached","Unattached","Not supplied",null,null,"ciaran-strike"],
[478,"340","Ross","Ashton","M","M45","44:05","unattached","Unattached","Not supplied",null,null,"ross-ashton"],
[479,"1133","Harry","Atkins","M","MO","43:34","unattached","Unattached","Not supplied",null,null,"harry-atkins"],
[480,"1228","Jason","Peck","M","M45","44:06","unattached","Unattached","Not supplied",null,null,"jason-peck"],
[481,"954","Tom","Harvey","M","MO","43:57","unattached","Unattached","Not supplied",null,null,"tom-harvey"],
[482,"1428","David","Vass","M","MO","43:37","unattached","Unattached","Not supplied",null,null,"david-vass"],
[483,"1496","William","Stewart","M","MO","43:12","unattached","Unattached","Not supplied",null,null,"william-stewart"],
[484,"682","Sam","Mackinnon","M","MO","44:08","unattached","Unattached","Not supplied",null,null,"sam-mackinnon"],
[485,"706","Richard","Lovett","M","M40","44:02","unattached","Unattached","Not supplied",null,null,"richard-lovett"],
[486,"1097","Reuben","Bartley","M","MO","44:10","unattached","Unattached","Not supplied",null,null,"reuben-bartley"],
[487,"391","Matthew","Adams","M","M45","44:13","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","matthew-adams"],
[488,"710","Frank","Vandenberghe","M","M50","43:34","unattached","Unattached","Not supplied",null,null,"frank-vandenberghe"],
[489,"380","Chris","Peck","M","MO","43:47","unattached","Waveney Valley AC","Not supplied",null,null,"chris-peck"],
[490,"765","Matthew","Coe","M","MO","44:24","unattached","Unattached","Not supplied",null,null,"matthew-coe"],
[491,"330","Alexandra","Ely","F","F50","44:01","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","alexandra-ely"],
[492,"280","Harley","Peek","M","MO","44:12","unattached","Unattached","Not supplied",null,null,"harley-peek"],
[493,"1582","Emma","Town","F","F40","44:21","unattached","Unattached","Not supplied",null,null,"emma-town"],
[494,"1371","Marcus","Paterson","M","MO","43:28","unattached","Unattached","Not supplied",null,null,"marcus-paterson"],
[495,"337","Stephen","Jessop","M","MO","44:04","unattached","Unattached","Not supplied",null,null,"stephen-jessop"],
[496,"338","Richard","Hancock","M","M45","44:16","unattached","Unattached","Not supplied",null,null,"richard-hancock"],
[497,"1215","Steve","Woolston","M","MO","44:22","unattached","Unattached","Not supplied",null,null,"steve-woolston"],
[498,"286","Daniel","Bodimeade","M","MO","43:53","unattached","Unattached","Not supplied",null,null,"daniel-bodimeade"],
[499,"1190","David","Roe","M","MO","44:15","unattached","Unattached","Not supplied",null,null,"david-roe"],
[500,"1421","Harry","Liversedge","M","MO","43:20","unattached","Unattached","Not supplied",null,null,"harry-liversedge"]
];
export const athletesRn2025B5B: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
