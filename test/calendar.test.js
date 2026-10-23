import test from 'node:test';
import assert from 'node:assert/strict';
import {madridToUTC,parseChannelPage} from '../lib/data.js';
import {calendar} from '../api/calendar.js';
test('Madrid CET and CEST',()=>{
 assert.equal(madridToUTC('2026-10-24','01:00').toISOString(),'2026-10-23T23:00:00.000Z');
 assert.equal(madridToUTC('2026-10-31','00:30').toISOString(),'2026-10-30T23:30:00.000Z');
});
test('Only NBA entries on the channel page',()=>{
 const html='<body><h2>sábado 24 de octubre (2)</h2><div><p>NBA</p><p>Boston Celtics</p><span> - </span><p>New York Knicks</p><span>01:00</span><span>Amazon Prime Video NBA League Pass</span></div><p>Liga Endesa</p><p>Madrid - Barcelona</p></body>';
 const r=parseChannelPage(html,'prime',new Date('2026-10-23T13:00:00Z'));
 assert.equal(r.length,1);assert.equal(r[0].day,'2026-10-24');
 assert.equal(r[0].start,'2026-10-23T23:00:00.000Z');
});
test('ICS contains valid delimiters, stable UID and alarms',()=>{
 const fixture={platform:'prime',day:'2026-10-24',hour:'01:00',start:'2026-10-23T23:00:00.000Z',home:'Boston Celtics',away:'New York Knicks',source:'https://example.com'};
 const ics=calendar([fixture],'prime');
 assert.match(ics,/BEGIN:VCALENDAR\r\n/);assert.match(ics,/BEGIN:VEVENT\r\n/);
 assert.match(ics,/DTSTART:20261023T230000Z/);assert.match(ics,/TRIGGER:-PT15M/);
 assert.doesNotMatch(ics,/DAZN\]/);
});
test('Parses accented day headings encoded as numeric HTML entities',()=>{
 const html='<h2>s&#xE1;bado 31 de octubre</h2><div>NBA</div><div>Philadelphia 76ers</div><span>-</span><div>New York Knicks</div><time>00:30</time><span>Amazon Prime Video</span>';
 const r=parseChannelPage(html,'prime',new Date('2026-10-23T00:00:00Z'));
 assert.equal(r.length,1);assert.equal(r[0].day,'2026-10-31');
});
