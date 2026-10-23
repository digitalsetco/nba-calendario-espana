import { getSchedule } from '../lib/data.js';
const clean=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function fold(s){
  const out=[];let line='';
  for(const c of s){
    if(Buffer.byteLength(line+c,'utf8')>74){out.push(line);line=' '+c;}
    else line+=c;
  }
  out.push(line); return out.join('\r\n');
}
const asICS=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
export function calendar(events,platform='all'){
  const name=platform==='dazn'?'NBA · DAZN España':platform==='prime'?'NBA · Prime Video España (sin League Pass)':'NBA · DAZN + Prime Video España';
  const now=asICS(new Date());
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//NBA Espana Calendar//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+clean(name),'X-WR-TIMEZONE:Europe/Madrid','REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:PT24H'];
  for(const e of events){
    if(platform!=='all'&&e.platform!==platform)continue;
    const date=asICS(e.start),end=asICS(new Date(Date.parse(e.start)+2.5*3600_000));
    const platformLabel=e.platform==='prime'?'Prime Video (incluido con Prime; sin League Pass)':'DAZN (plan con NBA)';
    const uidKey=`${e.platform}-${e.day}-${e.home}-${e.away}`.toLowerCase().replace(/[^a-z0-9-]/g,'-');
    lines.push('BEGIN:VEVENT', 'UID:'+uidKey+'@nba-calendario-espana', 'DTSTAMP:'+now, 'DTSTART:'+date, 'DTEND:'+end,
      'SUMMARY:'+clean(`NBA · ${e.home} vs ${e.away} [${e.platform==='prime'?'Prime':'DAZN'}]`),
      'DESCRIPTION:'+clean(`Emisión en España: ${platformLabel}\nHora española: ${e.day} ${e.hour}\nFuente: ${e.source}`),
      'URL:'+e.source,'STATUS:CONFIRMED','TRANSP:TRANSPARENT',
      'BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY','DESCRIPTION:'+clean('NBA en '+(e.platform==='prime'?'Prime Video':'DAZN')),'END:VALARM','END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n')+'\r\n';
}
export default async function handler(req,res){
  const platform=String(req.query.platform||'all').toLowerCase();
  if(!['all','prime','dazn'].includes(platform))return res.status(400).send('Platform must be all, prime or dazn');
  try{
    const r=await getSchedule();
    res.setHeader('Content-Type','text/calendar; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=7200');
    res.setHeader('Content-Disposition',`inline; filename="nba-${platform}.ics"`);
    res.status(200).send(calendar(r.events,platform));
  }catch(e){res.status(500).send('No se pudo generar el calendario');}
}