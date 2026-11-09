import test from 'node:test';
import assert from 'node:assert/strict';
import explain from '../netlify/functions/explain.mjs';
import speak from '../netlify/functions/speak.mjs';
import {validateLanguage} from '../lib/common.mjs';
const jsonReq=(path,obj,code)=>new Request('https://app.test/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(code?{'x-class-code':code}:{})},body:JSON.stringify(obj)});
test('correct language defaults and invalid language',()=>{
 assert.equal(validateLanguage(undefined,'suomi'),'suomi');
 assert.throws(()=>validateLanguage('<script>','suomi'));
});
test('unknown text API key should not give fictional AI explanation',async()=>{
 delete process.env.OPENAI_API_KEY;
 const r=await explain(jsonReq('explain',{word:'yllättävä',explanationLanguage:'suomi',translationLanguage:'kurdisorani'}));
 assert.equal(r.status,503);assert.match((await r.json()).error,/OPENAI_API_KEY/);
});
test('input validation rejects huge requests',async()=>{
 const r=await explain(jsonReq('explain',{word:'x'.repeat(91)}));assert.equal(r.status,400);
});
test('classroom code gate',async()=>{
 process.env.CLASS_ACCESS_CODE='luokkakoodi';
 const r=await explain(jsonReq('explain',{word:'vastuu'}));assert.equal(r.status,401);
 delete process.env.CLASS_ACCESS_CODE;
});
test('AI translation response structured, model key server-side',async()=>{
 process.env.OPENAI_API_KEY='server-test-123';
 const old=globalThis.fetch;
 globalThis.fetch=async (url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/chat/completions');
   assert.equal(options.headers.Authorization,'Bearer server-test-123');
   const req=JSON.parse(options.body);
   assert.match(req.messages[2===3?2:1].content,/kurdisorani/);
   return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({simpleFinnish:'Vastuu on huolehtimista.',explanation:'Vastuu on huolehtimista.',translatedWord:'بەرپرسیارێتی',exampleFinnish:'Kannat vastuuta.',exampleTranslated:'',emoji:'🙌',imageSearch:'vastuu',nuance:''})}}]}),{status:200});
 };
 try {const r=await explain(jsonReq('explain',{word:'vastuu',explanationLanguage:'suomi',translationLanguage:'kurdisorani'}));assert.equal(r.status,200);const b=await r.json();assert.equal(b.result.translatedWord,'بەرپرسیارێتی');assert.equal(b.demo,false);} finally {globalThis.fetch=old;delete process.env.OPENAI_API_KEY;}
});
test('Sorani speech requires separate key and never switches to Arabic or English',async()=>{
 delete process.env.KURDISH_TTS_API_KEY;
 const r=await speak(jsonReq('speak',{text:'سڵاو',language:'kurdisorani'}));assert.equal(r.status,503);assert.match((await r.json()).error,/KURDISH_TTS_API_KEY/);
});
test('Sorani voice is explicitly Sorani and content-type is audio',async()=>{
 process.env.KURDISH_TTS_API_KEY='dummy';const old=globalThis.fetch;
 globalThis.fetch=async (url,options)=>{
   assert.equal(url,'https://www.kurdishtts.com/api/tts-proxy');const b=JSON.parse(options.body);
   assert.equal(b.speaker_id,'sorani_85');assert.equal(b.dialect,'sorani');
   return new Response(new Uint8Array([1,2,3]),{status:200,headers:{'content-type':'audio/mpeg'}});
 };
 try{const r=await speak(jsonReq('speak',{text:'سڵاو',language:'kurdisorani'}));assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'audio/mpeg');assert.equal((await r.arrayBuffer()).byteLength,3);}finally{globalThis.fetch=old;delete process.env.KURDISH_TTS_API_KEY;}
});
test('Finnish sound uses native Azure when configured, no English fallback',async()=>{
 process.env.AZURE_SPEECH_KEY='dummy';process.env.AZURE_SPEECH_REGION='northeurope';
 const old=globalThis.fetch;
 globalThis.fetch=async (url,options)=>{
   assert.match(url,/northeurope\.tts\.speech\.microsoft\.com/);
   assert.match(options.body,/fi-FI-NooraNeural/);return new Response(new Uint8Array([5,6]),{status:200,headers:{'content-type':'audio/mpeg'}});
 };
 try{const r=await speak(jsonReq('speak',{text:'Vastuu tarkoittaa huolehtimista.',language:'suomi'}));assert.equal(r.status,200);}finally{globalThis.fetch=old;delete process.env.AZURE_SPEECH_KEY;delete process.env.AZURE_SPEECH_REGION;}
});
test('unsupported speech languages reject rather than reading it with English accent',async()=>{
 process.env.OPENAI_API_KEY='dummy'; const r=await speak(jsonReq('speak',{text:'Testi',language:'somali'}));assert.equal(r.status,503);assert.match((await r.json()).error,/ei ole vielä/);delete process.env.OPENAI_API_KEY;
});
