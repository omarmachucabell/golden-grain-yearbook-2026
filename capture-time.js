// Keep the camera's recorded wall time; an absent UTC offset is not guessed.
export function captureTime(record) {
 if(record?.status!=='dated' || !['DateTimeOriginal','DateTimeDigitized'].includes(record.source))return null;
 const value=record.capturedAt;
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value || ''))return null;
 const date=new Date(value+'Z');
 if(Number.isNaN(date.getTime()) || date.toISOString().slice(0,19)!==value)return null;
 const label=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(date);
 const offset=/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(record.offset || '')?record.offset:'';
 return {label,dateTime:value+offset,title:'Camera-recorded '+(record.source==='DateTimeOriginal'?'capture':'creation')+' time'+(offset?' (UTC'+offset+')':'; time zone not recorded')};
}

// Sort by the same camera-local date shown in the viewer. Missing dates stay last.
export function compareTakenDates(a,b,newestFirst=false){
 if(!a && !b)return 0;
 if(!a)return 1;
 if(!b)return -1;
 const comparison=a.localeCompare(b);
 return comparison ? (newestFirst?-comparison:comparison) : 0;
}
