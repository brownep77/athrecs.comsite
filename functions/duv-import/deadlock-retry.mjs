const confirmedRollbacks=new WeakSet();
const reserveMs=12000;
const backoffMs=[250,750];
const defaultSleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// Call only after the transaction's awaited ROLLBACK has succeeded. A private
// WeakSet prevents a database error's public properties from enabling retries.
export function markRollbackConfirmed(error){
 if(error&&typeof error==='object')confirmedRollbacks.add(error);
 return error;
}

export async function retryDeadlockedProfileChunk(operation,{
 deadline,maxRetries=2,onRetry,sleep=defaultSleep,now=Date.now,
}={}){
 if(!Number.isFinite(deadline))throw new TypeError('A finite worker deadline is required');
 if(!Number.isInteger(maxRetries)||maxRetries<0||maxRetries>2)throw new RangeError('maxRetries must be between 0 and 2');
 let retries=0;
 for(;;){
  try{return await operation();}catch(error){
   if(error?.code!=='40P01'||!confirmedRollbacks.has(error)||retries>=maxRetries)throw error;
   const delayMs=backoffMs[retries];
   if(now()+delayMs>=deadline-reserveMs)throw error;
   const retry=retries+1;
   if(onRetry)await onRetry({error,retry,delayMs});
   if(now()+delayMs>=deadline-reserveMs)throw error;
   await sleep(delayMs);
   if(now()>=deadline-reserveMs)throw error;
   retries=retry;
  }
 }
}
