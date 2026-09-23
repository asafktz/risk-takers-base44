import { createHmac, timingSafeEqual } from 'node:crypto';
import { RECORDINGS, RECORDING_EVENT, RECORDING_BUCKET } from '../config/recordings.js';
const BASE='https://umznkxyzovuzhavkmqjt.supabase.co';
const COOKIE='rt_recordings';
const DAYS=30*24*60*60;
const secret=()=>process.env.SUPABASE_SERVICE_ROLE_KEY;
const mac=s=>createHmac('sha256',secret()).update('risk-takers-recordings-v1:'+s).digest('base64url');
const equal=(a,b)=>Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function makeSession(id,now=Date.now()){const body=Buffer.from(JSON.stringify({id,event:RECORDING_EVENT,exp:Math.floor(now/1000)+DAYS})).toString('base64url');return body+'.'+mac(body);}
export function readSession(cookie='',now=Date.now()){
 try{const token=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||token.length>1000)return null;const [body,sig,...rest]=token.split('.');if(rest.length||!sig||!equal(mac(body),sig))return null;const data=JSON.parse(Buffer.from(body,'base64url'));return data.exp>now/1000&&data.event===RECORDING_EVENT&&/^[a-f0-9-]{36}$/.test(data.id)?data:null;}catch{return null;}
}
export function validateRegistration(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw Object.assign(new Error('Invalid request'),{status:400});
 const name=typeof body.name==='string'?body.name.trim():'';const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(name.length<2||name.length>120||[...name].some(c=>c.charCodeAt(0)<32)||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||body.website)throw Object.assign(new Error('Please enter your name and a valid email address.'),{status:400});
 return {name,email};
}
async function backend(path,options={}){
 const r=await fetch(BASE+path,{...options,headers:{apikey:secret(),Authorization:`Bearer ${secret()}`,'Content-Type':'application/json',...options.headers}});
 if(!r.ok){const text=await r.text();if(text.includes('REPLAY_RATE_LIMIT'))throw Object.assign(new Error('Too many requests. Please try again in a few minutes.'),{status:429});throw Object.assign(new Error('Recording access is temporarily unavailable. Please try again.'),{status:503});}
 return r;
}
async function registered(req){const session=readSession(req.headers.cookie);if(!session)return null;const r=await backend(`/rest/v1/recording_registrations?id=eq.${session.id}&event_slug=eq.${RECORDING_EVENT}&select=id&limit=1`);return (await r.json()).length?session:null;}
async function bodyOf(req){if(req.body&&typeof req.body==='object'){if(Buffer.byteLength(JSON.stringify(req.body))>16384)throw Object.assign(new Error('Request too large'),{status:413});return req.body;}let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)throw Object.assign(new Error('Request too large'),{status:413});}try{return JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('Invalid request'),{status:400});}}
function validOrigin(req){const allowed=['https://www.risktakers.show','https://risktakers.show',...['VERCEL_URL','VERCEL_BRANCH_URL'].map(k=>process.env[k]&&`https://${process.env[k]}`)];if(!process.env.VERCEL_ENV)allowed.push('http://localhost:5187');return allowed.includes(req.headers.origin);}
export async function signedManifest(id){
 const raw=await (await backend(`/storage/v1/object/${RECORDING_BUCKET}/${id}/index.m3u8`)).text();
 const names=[...new Set(raw.split('\n').flatMap(line=>line.startsWith('#EXT-X-MAP:')?[line.match(/URI="([^"]+)"/)?.[1]]:line&&!line.startsWith('#')?[line.trim()]:[]))];
 if(names.some(n=>!n||!/^(init\.mp4|segment-\d+\.m4s)$/.test(n)))throw new Error('Invalid recording manifest');
 const paths=names.map(n=>`${id}/${n}`);const data=await (await backend(`/storage/v1/object/sign/${RECORDING_BUCKET}`,{method:'POST',body:JSON.stringify({expiresIn:7200,paths})})).json();
 const urls=new Map(data.map(x=>[x.path,x.signedURL]));if(paths.some(p=>!urls.get(p)))throw new Error('Could not load recording');
 return raw.split('\n').map(line=>{if(line.startsWith('#EXT-X-MAP:'))return line.replace(/URI="([^"]+)"/,(_,n)=>`URI="${BASE}/storage/v1${urls.get(id+'/'+n)}"`);return line&&!line.startsWith('#')?BASE+'/storage/v1'+urls.get(id+'/'+line.trim()):line;}).join('\n');
}
export default async function replay(req,res){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(!secret())throw Object.assign(new Error('Recording access is temporarily unavailable.'),{status:503});
  const action=req.query?.action||'status';
  // Temporary asset ingestion is restricted to the preview runtime and a separate secret.
  if(action==='upload'&&req.method==='POST'){
   const key=process.env.RECORDING_UPLOAD_KEY;const bearer=(req.headers.authorization||'').replace(/^Bearer /,'');
   if(process.env.VERCEL_ENV!=='preview'||!key||!equal(bearer,key))return res.status(404).json({error:'Not found'});
   const body=await bodyOf(req);
   if(body.initialize){const r=await fetch(BASE+'/storage/v1/bucket',{method:'POST',headers:{Authorization:`Bearer ${secret()}`,apikey:secret(),'Content-Type':'application/json'},body:JSON.stringify({id:RECORDING_BUCKET,name:RECORDING_BUCKET,public:false,file_size_limit:40000000})});if(!r.ok&&r.status!==409&&!(await r.text()).includes('already exists'))throw new Error('Could not prepare media storage');return res.status(200).json({ready:true});}
   const paths=body.paths;if(!Array.isArray(paths)||!paths.length||paths.length>50||paths.some(p=>typeof p!=='string'||!RECORDINGS.some(r=>p.startsWith(r.id+'/'))||!/^[a-z0-9-]+\/(index\.m3u8|init\.mp4|segment-\d+\.m4s)$/.test(p)))return res.status(400).json({error:'Invalid media paths'});
   const uploads=await Promise.all(paths.map(async path=>{const data=await (await backend(`/storage/v1/object/upload/sign/${RECORDING_BUCKET}/${path}`,{method:'POST',headers:{'x-upsert':'true'},body:'{}'})).json();return {path,url:BASE+'/storage/v1'+data.url};}));return res.status(200).json({uploads});
  }
  if(action==='register'&&req.method==='POST'){
   if(!validOrigin(req))return res.status(403).json({error:'Please register from the Risk Takers website.'});
   const {name,email}=validateRegistration(await bodyOf(req));const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   const id=await (await backend('/rest/v1/rpc/register_recording_access',{method:'POST',body:JSON.stringify({p_name:name,p_email:email,p_ip_hash:mac('ip:'+new Date().toISOString().slice(0,10)+':'+ip)})})).json();
   if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))throw new Error('Registration not persisted');
   res.setHeader('Set-Cookie',`${COOKIE}=${makeSession(id)}; Path=/api/replay; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS}`);return res.status(200).json({unlocked:true});
  }
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const session=await registered(req);
  if(action==='status')return res.status(200).json({unlocked:!!session});
  if(action!=='stream')return res.status(404).json({error:'Not found'});
  if(!session)return res.status(401).json({error:'Enter your name and email to watch.'});
  const id=req.query.id;if(!RECORDINGS.some(r=>r.id===id))return res.status(404).json({error:'Recording not found'});
  res.setHeader('Content-Type','application/vnd.apple.mpegurl');return res.status(200).send(await signedManifest(id));
 }catch(error){return res.status(error.status||503).json({error:error.status?error.message:'Recording access is temporarily unavailable. Please try again.'});}
}
