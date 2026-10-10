// Profile visibility is separate from publication or verification of source results.
export function profileVisibility(job){
 const p=job.configuration?.profilePublication;
 if(!p||p.revokedAt)return 'private';
 if(p.visibility!=='public'||p.scope!=='duv_created_unclaimed_profiles'||
  !p.approvalId||!p.approvedBy||!p.instruction||!Number.isFinite(Date.parse(p.approvedAt)))
  throw Error('invalid_profile_publication_approval');
 return 'public';
}
