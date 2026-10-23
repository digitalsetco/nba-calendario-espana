import { getSchedule } from '../lib/data.js';
export default async function handler(_req,res){
  try{const r=await getSchedule();res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=7200');res.setHeader('Access-Control-Allow-Origin','*');res.status(200).json(r);}
  catch(e){res.status(500).json({error:'Error fetching NBA schedule'});}
}