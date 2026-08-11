import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[401,"812","Anthony","Kendrick","M","MO","43:10","unattached","Unattached","Not supplied",null,null,"anthony-kendrick"],
[402,"719","Chris","Wells","M","M45","43:19","unattached","Unattached","Not supplied",null,null,"chris-wells"],
[403,"453","Jack","Crosthwaite","M","MO","42:35","unattached","Unattached","Not supplied",null,null,"jack-crosthwaite"],
[404,"867","Lydia","Pouncey","F","FO","43:08","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","lydia-pouncey"],
[405,"414","Cameron","Stringer","M","MO","42:36","unattached","Unattached","Not supplied",null,null,"cameron-stringer"],
[406,"450","Lewis","Williams","M","MO","42:48","unattached","Unattached","Not supplied",null,null,"lewis-williams"],
[407,"1040","Christine","Faulkner","F","F45","42:57","unattached","Unattached","Not supplied",null,null,"christine-faulkner"],
[408,"1224","Charlie","Potter","M","MO","43:40","unattached","Unattached","Not supplied",null,null,"charlie-potter"],
[409,"303","Charli","Smith","F","FO","43:34","unattached","Unattached","Not supplied",null,null,"charli-smith"],
[410,"1091","Nick","Randall","M","M50","43:24","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","nick-randall"],
[411,"681","Edmond","Hapchina","M","MO","43:12","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","edmond-hapchina"],
[412,"441","Louise","Juby","F","F45","43:13","unattached","Orion Harriers","Not supplied",null,null,"louise-juby"],
[413,"1038","Alex","Fage","M","MO","43:02","unattached","Unattached","Not supplied",null,null,"alex-fage"],
[414,"796","Grant","Bradfield","M","MO","43:17","unattached","Unattached","Not supplied",null,null,"grant-bradfield"],
[415,"388","Chris","Ellis","M","MO","43:01","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","chris-ellis"],
[416,"373","Billy","Dunthorne","M","MO","43:28","unattached","Unattached","Not supplied",null,null,"billy-dunthorne"],
[417,"308","Ross","Lenton","M","M40","42:54","unattached","Unattached","Not supplied",null,null,"ross-lenton"],
[418,"598","Pete","Brooks","M","M40","43:24","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","pete-brooks"],
[419,"444","Tommy","Chambers","M","MO","43:06","unattached","Unattached","Not supplied",null,null,"tommy-chambers"],
[420,"988","Timothy","Levitt","M","MO","43:12","unattached","Unattached","Not supplied",null,null,"timothy-levitt"],
[421,"945","Nick","Cleaver","M","M40","42:50","unattached","Unattached","Not supplied",null,null,"nick-cleaver"],
[422,"348","William","Robb","M","MO","43:11","unattached","Unattached","Not supplied",null,null,"william-robb"],
[423,"206","Adam","Smith","M","MO","42:54","unattached","Unattached","Not supplied",null,null,"adam-smith"],
[424,"461","Zoe","Stiby","F","FO","43:30","unattached","Unattached","Not supplied",null,null,"zoe-stiby"],
[425,"545","Michael","Fisher","M","MO","43:05","unattached","Unattached","Not supplied",null,null,"michael-fisher"],
[426,"596","Abi","Cossey","F","FO","43:18","unattached","Unattached","Not supplied",null,null,"abi-cossey"],
[427,"1071","Nathan","Gardiner","M","MO","42:37","unattached","Unattached","Not supplied",null,null,"nathan-gardiner"],
[428,"90","Jake","Hart","M","MO","43:06","unattached","Unattached","Not supplied",null,null,"jake-hart"],
[429,"358","Will","Alexander","M","MO","43:03","unattached","Unattached","Not supplied",null,null,"will-alexander"],
[430,"801","Ollie","Charlish","M","MO","43:17","unattached","Unattached","Not supplied",null,null,"ollie-charlish"],
[431,"322","William","Kitchener","M","M40","42:54","unattached","Unattached","Not supplied",null,null,"william-kitchener"],
[432,"525","Lee","Richardson","M","M40","43:37","unattached","Unattached","Not supplied",null,null,"lee-richardson"],
[433,"401","Andrew","Johns","M","M40","43:22","unattached","Unattached","Not supplied",null,null,"andrew-johns"],
[434,"241","Tony","Witmond","M","M55","43:42","unattached","Unattached","Not supplied",null,null,"tony-witmond"],
[435,"507","Richard","Broughton","M","M40","43:32","unattached","Unattached","Not supplied",null,null,"richard-broughton"],
[436,"5767","Matthew","Sanders","M","M55","43:17","unattached","Unattached","Not supplied",null,null,"matthew-sanders"],
[437,"1171","Jonathan","Weavers","M","M50","43:51","unattached","Unattached","Not supplied",null,null,"jonathan-weavers"],
[438,"929","Warren","Tutt","M","MO","43:58","unattached","Unattached","Not supplied",null,null,"warren-tutt"],
[439,"848","Joshua","Kirby","M","MO","43:44","unattached","Unattached","Not supplied",null,null,"joshua-kirby"],
[440,"86","Thomas","Abbs","M","MO","43:00","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","thomas-abbs"],
[441,"245","Reuben","Houghton","M","MO","43:53","unattached","Unattached","Not supplied",null,null,"reuben-houghton"],
[442,"1405","Sinead","Taylor","F","FO","43:24","unattached","Unattached","Not supplied",null,null,"sinead-taylor"],
[443,"677","Marty","Wilson","M","M45","43:57","unattached","Unattached","Not supplied",null,null,"marty-wilson"],
[444,"2516","Annelies","Dixie","F","FO","43:59","unattached","Unattached","Not supplied",null,null,"annelies-dixie"],
[445,"540","Jonathan","Abbs","M","MO","43:47","unattached","Unattached","Not supplied",null,null,"jonathan-abbs"],
[446,"1197","Martin","Merryweather","M","MO","43:25","unattached","Unattached","Not supplied",null,null,"martin-merryweather"],
[447,"174","Jason","Elrick","M","M55","43:37","unattached","Thetford AC","Not supplied",null,null,"jason-elrick"],
[448,"563","Stephen","Ambrose","M","MO","43:49","unattached","Unattached","Not supplied",null,null,"stephen-ambrose"],
[449,"659","Martijn","Muntingh","M","M45","43:27","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","martijn-muntingh"],
[450,"1452","George","Weeden","M","MO","43:12","unattached","Unattached","Not supplied",null,null,"george-weeden"]
];
export const athletesRn2025B5A: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
