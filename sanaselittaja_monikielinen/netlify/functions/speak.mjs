import {json, parseInput, authorize, validateLanguage, friendlyUpstream, fetchTimed, getErrorStatus} from '../../lib/common.mjs';
const mp3Headers = {'content-type':'audio/mpeg','cache-control':'no-store','x-content-type-options':'nosniff'};
const speechError = (msg, status=503) => json({error:msg},status);
const escapeXML = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const supported = new Set(['af','ar','hy','az','be','bs','bg','ca','zh','hr','cs','da','nl','en','et','fi','fr','gl','de','el','he','hi','hu','is','id','it','ja','kn','kk','ko','lv','lt','mk','ms','mr','mi','ne','no','fa','pl','pt','ro','ru','sr','sk','sl','es','sw','sv','tl','ta','th','tr','uk','ur','vi','cy']);
const codeMap = {'suomi':'fi','kurdisorani':'ckb','sorani':'ckb','kurdin sorani':'ckb','kurmandži':'kmr','kurmanji':'kmr', 'englanti':'en','ruotsi':'sv', 'arabia':'ar','venäjä':'ru','viro':'et','saksa':'de','ranska':'fr','espanja':'es','italia':'it','portugali':'pt','turkki':'tr','farsi':'fa','persia':'fa','dari':'fa','ukraina':'uk','kiina':'zh','japani':'ja','somali':'so','albania':'sq','vietnam':'vi','hindi':'hi','urdu':'ur','nepali':'ne','bengali':'bn','tigrinja':'ti','swahili':'sw','puola':'pl','romania':'ro','norja':'no','tanska':'da','hollanti':'nl','kreikka':'el'};
function norm(lang) {
  const s=lang.toLowerCase().trim();
  if (s==='ckb' || s.startsWith('ckb-')) return 'ckb';
  if (s==='kmr' || s.startsWith('kmr-')) return 'kmr';
  return codeMap[s] || s.split('-')[0];
}
async function sound(url, headers, body) {
  const r=await fetchTimed(url,{method:'POST',headers,body:JSON.stringify(body)},25000);
  if(!r.ok) return {error:friendlyUpstream(r.status,'Puhepalvelu')};
  return {buf:await r.arrayBuffer(), type:r.headers.get('content-type')||'audio/mpeg'};
}
async function azureFinnish(text) {
  const region=process.env.AZURE_SPEECH_REGION||'';
  if (!/^[a-z0-9-]{3,32}$/.test(region)) return {error:'Azure Speech -alue on virheellinen.'};
  const r=await fetchTimed(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method:'POST',
    headers: {'Ocp-Apim-Subscription-Key':process.env.AZURE_SPEECH_KEY,'content-type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-96kbitrate-mono-mp3','User-Agent':'Sanaselittaja'},
    body:`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fi-FI"><voice name="fi-FI-NooraNeural"><prosody rate="-12%">${escapeXML(text)}</prosody></voice></speak>`
  },25000);
  if(!r.ok) return {error:friendlyUpstream(r.status,'Suomen puheääni')};
  return {buf:await r.arrayBuffer(),type:'audio/mpeg'};
}
async function kurdish(text, code) {
  if(!process.env.KURDISH_TTS_API_KEY) return {error:'Kurdin ääneenluku vaatii ylläpitäjältä KURDISH_TTS_API_KEY-avaimen.'};
  return sound('https://www.kurdishtts.com/api/tts-proxy',{
    'x-api-key':process.env.KURDISH_TTS_API_KEY,'content-type':'application/json'
  },{text,speaker_id:code==='ckb'?'sorani_85':'kurmanji_6',model_version:'v3',dialect:code==='ckb'?'sorani':'kurmanji',format:'mp3',speed:.87});
}
async function openaiSpeech(text, code) {
  if(!process.env.OPENAI_API_KEY) return {error:'Puhepalveluun tarvitaan OpenAI API -avain.'};
  if(!supported.has(code)) return {error:'Tälle kielelle ei ole vielä luotettavaa puheääntä. Tekstikäännös toimii silti.'};
  const prompt=code==='fi' ? 'Puhu aidolla suomalaisella suomen ääntämyksellä, ei englannin aksentilla. Rauhallinen, selkeä ääni koululaiselle.' : `Puhu tekstin omalla kielellä (${code}) selkeästi, älä käytä englannin ääntämistä. Rauhallinen opetusääni.`;
  return sound('https://api.openai.com/v1/audio/speech',{
    'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'
  },{model:process.env.OPENAI_TTS_MODEL||'gpt-4o-mini-tts',voice:'marin',input:text,instructions:prompt,response_format:'mp3',speed:.88});
}
export default async function handler(request) {
  try {
    authorize(request);
    const body=await parseInput(request);
    const text=String(body?.text||'').trim();
    if(!text || text.length>450 || /[\x00-\x08]/.test(text)) return speechError('Ääneen luettava teksti on liian pitkä tai tyhjä (enintään 450 merkkiä).',400);
    const language=validateLanguage(body?.language,'suomi');
    const code=norm(language);
    let out;
    if(code==='ckb'||code==='kmr') out=await kurdish(text,code);
    else if(code==='fi'&&process.env.AZURE_SPEECH_KEY) out=await azureFinnish(text);
    else out=await openaiSpeech(text,code);
    if(out.error) return speechError(out.error);
    return new Response(out.buf,{status:200,headers:{...mp3Headers,'content-type':out.type.startsWith('audio/')?out.type:'audio/mpeg'}});
  } catch(e) {
    return speechError(e?.name==='TimeoutError'?'Puhepalvelu ei vastannut ajoissa.':(e?.message||'Ääneenluku epäonnistui.'),getErrorStatus(e));
  }
}
