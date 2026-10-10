// Profile visibility is separate from publication or verification of source results.
export function profileVisibility(job){
 const p=job.configuration?.profilePublication;
 if(!p||p.revokedAt)return 'private';
 if(p.visibility!=='public'||p.scope!=='duv_created_unclaimed_profiles'||
  !p.approvalId||!p.approvedBy||!p.instruction||!Number.isFinite(Date.parse(p.approvedAt)))
  throw Error('invalid_profile_publication_approval');
 return 'public';
}

// Publishing evidence never changes its verification status or account sharing.
export function historyPublicationApproval(job){
 const p=job.configuration?.historyPublication;
 if(!p||p.revokedAt)return null;
 if(p.visibility!=='public'||p.scope!=='duv_matched_unclaimed_public_profiles'||
  !p.approvalId||!p.approvedBy||!p.instruction||!Number.isFinite(Date.parse(p.approvedAt)))
  throw Error('invalid_history_publication_approval');
 return p;
}
