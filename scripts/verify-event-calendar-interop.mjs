import assert from 'node:assert/strict';
const { default: ICAL } = await import(process.env.CALENDAR_ICAL_MODULE || 'ical.js');
import {buildCalendarEvent,calendarIcs} from '../src/lib/athrecs/event-calendar.ts';
const base={id:'parser-test',name:'東京 🏃 Café, ; \\ \nBEGIN:VEVENT',date:'2027-07-04',startTime:'10:00',timeZone:'Europe/London',pageUrl:'https://www.athrecs.com/races/test',location:'Venue, café; hall'};
let n=0;
for(const sample of [{},{startTime:null},{startTime:null,endDate:'2027-07-06'},{date:'2027-12-31',startTime:null},{date:'2027-03-28',startTime:'01:30'},{startTime:'23:00',endDate:'2027-07-05',endTime:'02:00'},{provisional:true},{name:'東京 🏃🏽 '.repeat(80)}]){
 const input={...base,...sample};const model=buildCalendarEvent(input);const parsed=new ICAL.Component(ICAL.parse(calendarIcs(model)));const events=parsed.getAllSubcomponents('vevent');assert.equal(events.length,1);
 const event=events[0];assert.equal(event.getFirstPropertyValue('summary'),model.title);assert.equal(event.getFirstPropertyValue('location'),model.location);assert.equal(event.getFirstPropertyValue('description'),model.description);assert.equal(event.getFirstPropertyValue('uid'),model.uid);
 const start=event.getFirstPropertyValue('dtstart');assert.equal(start.toString(),model.startUtc??model.date);assert.equal(start.isDate,!model.startUtc);
 const end=event.getFirstPropertyValue('dtend');if(!model.startUtc)assert.equal(end.toString(),model.endDateExclusive);else if(model.endUtc)assert.equal(end.toString(),model.endUtc);else assert.equal(end,null);
 n++;
}
console.log('PASS: '+n+' ICS roundtrips through independent ical.js 2.2.1 parser: UTC/all-day/multiday/rollover/DST/Unicode/escaping/UID.');
