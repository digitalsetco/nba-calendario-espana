
// Spain-only television listings. A League Pass icon may appear alongside DAZN/Prime
// for the same game; we never use the League Pass channel to discover games.
export const SOURCES = {
  dazn: 'https://www.baloncestohoy.es/canales/dazn',
  prime: 'https://www.baloncestohoy.es/canales/amazon-prime-video'
};
export const DAZN_OFFICIAL = 'https://dazngroup.com/press-room/la-nba-regresa-a-dazn-con-una-nueva-temporada-y-todas-las-finales-en-directo/';
export const PRIME_SPAIN = 'https://www.gigantes.com/nba/donde-ver-nba-espana-tv-streaming-prime-video-dazn/';

const teamNames = [
  'Atlanta Hawks','Boston Celtics','Brooklyn Nets','Charlotte Hornets','Chicago Bulls',
  'Cleveland Cavaliers','Dallas Mavericks','Denver Nuggets','Detroit Pistons',
  'Golden State Warriors','Houston Rockets','Indiana Pacers','Los Angeles Clippers',
  'Los Angeles Lakers','Memphis Grizzlies','Miami Heat','Milwaukee Bucks',
  'Minnesota Timberwolves','New Orleans Pelicans','New York Knicks',
  'Oklahoma City Thunder','Orlando Magic','Philadelphia 76ers','Phoenix Suns',
  'Portland Trail Blazers','Sacramento Kings','San Antonio Spurs','Toronto Raptors',
  'Utah Jazz','Washington Wizards'
];
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g,'');
const teams = new Map(teamNames.map(s=>[norm(s),s]));
const aliases = {
  'oklahomac': 'Oklahoma City Thunder', 'oklahomacido': 'Oklahoma City Thunder',
  'oklahomacthunder': 'Oklahoma City Thunder',
  'losangeles': 'Los Angeles Lakers', 'lalakers':'Los Angeles Lakers',
  'laclippers':'Los Angeles Clippers', 'portland':'Portland Trail Blazers',
  'lakers':'Los Angeles Lakers', 'clippers':'Los Angeles Clippers'
};
for(const [k,v] of Object.entries(aliases))teams.set(k,v);
function canonicalTeam(s){return teams.get(norm(s));}
const MONTHS={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
const pad=n=>String(n).padStart(2,'0');

// Convert local Spanish time to a real UTC timestamp, including DST.
export function madridToUTC(day,hour){
  const iso=`${day}T${hour}:00Z`;
  const utcGuess=Date.parse(iso);
  if(!Number.isFinite(utcGuess))throw new Error('Bad date: '+iso);
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Madrid',timeZoneName:'shortOffset'}).formatToParts(new Date(utcGuess));
  const str=parts.find(p=>p.type==='timeZoneName')?.value||'GMT';
  const match=str.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const minutes=match?(match[1]==='+'?1:-1)*(Number(match[2])*60+Number(match[3]||0)):0;
  return new Date(utcGuess-minutes*60*1000);
}
function game(platform,day,hour,home,away,source){
  if(!canonicalTeam(home)||!canonicalTeam(away)||!/^\d{4}-\d\d-\d\d$/.test(day)||!/^\d\d:\d\d$/.test(hour))return null;
  const start=madridToUTC(day,hour);
  if(Number.isNaN(start.getTime()))return null;
  return {platform, day, hour, home:canonicalTeam(home),away:canonicalTeam(away), start:start.toISOString(), source};
}
const DAZN_OCT_2026=[
  ['2026-10-20','21:00','Detroit Pistons','Boston Celtics'],
  ['2026-10-21','01:00','New York Knicks','Philadelphia 76ers'],
  ['2026-10-21','03:30','San Antonio Spurs','Oklahoma City Thunder'],
  ['2026-10-22','01:30','Miami Heat','Minnesota Timberwolves'],
  ['2026-10-22','04:00','Los Angeles Lakers','Golden State Warriors'],
  ['2026-10-23','01:00','Cleveland Cavaliers','Philadelphia 76ers'],
  ['2026-10-23','03:30','Oklahoma City Thunder','Denver Nuggets'],
  ['2026-10-25','00:00','Charlotte Hornets','Miami Heat'],
  ['2026-10-26','00:30','Philadelphia 76ers','Detroit Pistons'],
  ['2026-10-27','03:00','Denver Nuggets','Golden State Warriors'],
  ['2026-10-28','01:00','New York Knicks','Detroit Pistons'],
  ['2026-10-29','00:00','Indiana Pacers','Philadelphia 76ers'],
  ['2026-10-29','02:30','Dallas Mavericks','Oklahoma City Thunder'],
  ['2026-10-30','00:00','Atlanta Hawks','Cleveland Cavaliers'],
  ['2026-10-31','20:00','Utah Jazz','Portland Trail Blazers']
];
// These broadcasts are INCLUDED in Prime Spain, not its extra-cost League Pass channel.
// The Oct 24 Knicks game is 01:00 per Prime and multiple independent Spanish listings,
// not 00:30 as stated in an inconsistent news table.
const PRIME_CONFIRMED=[
  ['2026-10-24','01:00','Boston Celtics','New York Knicks'],
  ['2026-10-24','03:30','San Antonio Spurs','Houston Rockets'],
  ['2026-10-25','22:00','Utah Jazz','Los Angeles Lakers'],
  ['2026-10-31','00:30','Philadelphia 76ers','New York Knicks'],
  ['2026-10-31','03:00','Golden State Warriors','Los Angeles Lakers'],
  ['2026-11-01','20:30','Boston Celtics','Orlando Magic'],
  ['2026-11-07','01:30','Cleveland Cavaliers','Philadelphia 76ers'],
  ['2026-11-07','04:00','Los Angeles Lakers','Portland Trail Blazers'],
  ['2026-11-08','21:30','Philadelphia 76ers','Chicago Bulls']
];
const BASE=[...DAZN_OCT_2026.map(x=>game('dazn',...x,DAZN_OFFICIAL)),...PRIME_CONFIRMED.map(x=>game('prime',...x,PRIME_SPAIN))].filter(Boolean);

// Traverse DOM text nodes rather than scraping a cached rendered search snippet.
// The listing format is date header, NBA, team pairing, time, television channels.
export function parseChannelPage(html,platform, now=new Date()){
  // Extract small text nodes without a heavyweight HTML parser. The channel listing
  // groups each game by date, competition, participants and kick-off time.
  const raw=html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<(?:nav|footer|header|noscript|svg)\b[^>]*>[\s\S]*?<\/(?:nav|footer|header|noscript|svg)>/gi,' ')
    .replace(/<[^>]+>/g,'\n')
    .replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&')
    .replace(/&ntilde;/gi,'ñ').replace(/&#241;/gi,'ñ')
    .replace(/&aacute;/gi,'á').replace(/&eacute;/gi,'é')
    .replace(/&iacute;/gi,'í').replace(/&oacute;/gi,'ó')
    .replace(/&uacute;/gi,'ú');
  const tokens=raw.split(/[\r\n]+/).map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s && s.length<250);
  const result=[];
  let date=null;
  const monthFrom=now.getUTCMonth()+1, year=now.getUTCFullYear();
  for(let i=0;i<tokens.length;i++){
    const value=tokens[i];
    const dm=value.toLowerCase().match(/(?:lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)[,\s]+(?:\b(?:hoy|mañana)\b\s+)?(\d{1,2})\s+de\s+([a-záéíóú]+)/i);
    if(dm){
      const m=MONTHS[dm[2].normalize('NFD').replace(/[\u0300-\u036f]/g,'')];
      if(m){
        const y=year===2026 && monthFrom>=9 && m<8?2027:year===2027 && monthFrom<=6 && m>8?2026:year;
        date=`${y}-${pad(m)}-${pad(+dm[1])}`;
      }
      continue;
    }
    if(/^partidos anteriores$/i.test(value)){date=null;break;}
    if(!date||!/^nba$/i.test(value))continue;
    let home,away,when;
    for(let j=i+1;j<Math.min(tokens.length,i+17);j++){
      if(/^(liga endesa|eurocup|euroliga|nba|fiba|partidos anteriores)$/i.test(tokens[j]))break;
      if(!home && /\s[-–]\s/.test(tokens[j])){
        const a=tokens[j].split(/\s[-–]\s/);
        if(a.length===2 && canonicalTeam(a[0]) && canonicalTeam(a[1]))[home,away]=a;
      }
      if(!when && /^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(tokens[j]))when=tokens[j].padStart(5,'0');
    }
    if(home&&away&&when){const entry=game(platform,date,when,home,away,SOURCES[platform]);if(entry)result.push(entry);}
  }
  return result;
}

function matchKey(e){return `${e.platform}|${e.day}|${[e.home,e.away].sort().join('|')}`;}
function dedupe(items){const byKey=new Map();for(const e of items){if(e)byKey.set(matchKey(e),e);}return [...byKey.values()].sort((a,b)=>a.start.localeCompare(b.start));}
async function loadSource(platform){
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const response=await fetch(SOURCES[platform],{signal:controller.signal,headers:{'User-Agent':'NBA-Espana-Calendar/1.0 (+personal noncommercial calendar)','Accept':'text/html'}});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const html=await response.text();
    const items=parseChannelPage(html,platform);
    if(!items.length)throw new Error('No se han podido reconocer partidos NBA futuros');
    return {platform,status:'ok',count:items.length,events:items};
  }catch(e){return {platform,status:'unavailable',count:0,error:String(e.message||e),events:[]};}
  finally {clearTimeout(timer);}
}
export async function getSchedule(){
  const live=await Promise.all([loadSource('dazn'),loadSource('prime')]);
  const all=dedupe([...BASE,...live.flatMap(s=>s.events)]);
  const floor=Date.now()-8*24*3600_000;
  const horizon=Date.now()+240*24*3600_000;
  return {events:all.filter(e=>new Date(e.start).getTime()>=floor && new Date(e.start).getTime()<horizon),sources:live.map(({platform,status,count,error})=>({platform,status,count,...(error?{error}:{})})),generatedAt:new Date().toISOString(),notes:'Las plataformas se consultan en tiempo real al actualizarse la suscripción. Las programaciones nuevas dependen de su publicación por los canales consultados; si dejan de estar accesibles, solo se conservan los partidos confirmados incluidos como respaldo.'};
}