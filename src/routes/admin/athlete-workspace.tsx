import { createFileRoute } from "@tanstack/react-router";
import { AthleteWorkspace } from "@/components/athletes/AthleteWorkspace";
export const Route=createFileRoute('/admin/athlete-workspace')({
  validateSearch:(search:Record<string,unknown>)=>({athleteId:Number.isSafeInteger(Number(search.athleteId))&&Number(search.athleteId)>0?Number(search.athleteId):undefined}),
  head:()=>({meta:[{title:'Edit athletes & review results | ATHRECS Staff'},{name:'robots',content:'noindex, nofollow, noarchive'}]}),
  component:StaffWorkspace,
});
function StaffWorkspace(){const {athleteId}=Route.useSearch();return <AthleteWorkspace staff initialAthleteId={athleteId??null}/>;}
