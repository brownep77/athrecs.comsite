import { createFileRoute } from "@tanstack/react-router";
import { AthleteWorkspace } from "@/components/athletes/AthleteWorkspace";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";
export const Route=createFileRoute('/athlete-results')({head:()=>({meta:[{title:'My profile & pasted results | ATHRECS'},{name:'robots',content:'noindex, nofollow, noarchive'}]}),component:MyResultWorkspace});
function MyResultWorkspace(){const {user,isPending}=useCurrentUserState();if(!IS_ATHRECS_SITE)return <main className="mx-auto max-w-3xl p-6"><a href="https://www.athrecs.com/athlete-results">Open the AthRecs athlete workspace</a></main>;return <main className="mx-auto w-full max-w-7xl px-4 py-8">{isPending?<p role="status">Checking sign-in…</p>:user?<AthleteWorkspace staff={false}/>:<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-3xl font-semibold">My profile & pasted results</h1><p>Sign in to edit your linked profile, remove or restore its stored races, and submit results copied from another source for review.</p><button className="min-h-11 rounded-lg bg-cyan-800 px-4 py-2 font-semibold text-white" onClick={()=>openAthleteAuth({callbackURL:'/athlete-results'})}>Sign in or create an account</button></section>}</main>;}
