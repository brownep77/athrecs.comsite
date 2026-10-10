// Reviewed DUV day-form finish times. Preserve the displayed value and precision.
export function dayDuration(display,distance){
 const m=/^([1-9]\d*)d (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))? h$/.exec(display);
 if(!m||!/^\d+(?:\.\d+)?(?:km|mi)(?:\/\d+Etappen)?$/.test(distance))return null;
 if(+m[2]>=24||+m[3]>=60||+m[4]>=60)throw Error('invalid_day_duration_component');
 const seconds=String(BigInt(m[1])*86400n+BigInt(m[2])*3600n+BigInt(m[3])*60n+BigInt(m[4]))+(m[5]?'.'+m[5]:'');
 return {kind:'time',display,value:seconds,unit:'seconds',achievedDistanceMetres:null,finishTimeSeconds:seconds,eventDurationSeconds:null,timeBasis:'not_stated_in_table'};
}
