const $ = id => document.getElementById(id);
const LANGUAGES = [
  ['suomi','Suomi 🇫🇮'],['kurdisorani','Kurdi (sorani) کوردیی سۆرانی'],['kurmanji','Kurdi (kurmanji)'],
  ['englanti','Englanti'],['ruotsi','Ruotsi'],['arabia','Arabia'],['somali','Somali'],['venäjä','Venäjä'],['viro','Viro'],
  ['dari','Dari'],['persia','Persia / farsi'],['ukraina','Ukraina'],['saksa','Saksa'],['ranska','Ranska'],['espanja','Espanja'],
  ['italia','Italia'],['portugali','Portugali'],['turkki','Turkki'],['albania','Albania'],['tigrinja','Tigrinja'],['amhara','Amhara'],
  ['kiina','Kiina'],['japani','Japani'],['hindi','Hindi'],['urdu','Urdu'],['bengali','Bengali'],['nepali','Nepali'],
  ['vietnam','Vietnam'],['thai','Thai'],['swahili','Swahili'],['oromo','Oromo'],['puola','Puola'],['romania','Romania'],
  ['norja','Norja'],['tanska','Tanska'],['hollanti','Hollanti'],['kreikka','Kreikka'],['heprea','Heprea'],['bulgaria','Bulgaria'],
  ['kroatia','Kroatia'],['bosnia','Bosnia'],['serbia','Serbia'],['latvia','Latvia'],['liettua','Liettua'],['islanti','Islanti'],
  ['muu','Muu kieli – kirjoita itse…']
];
const demo = {
  'vastuu':{simpleFinnish:'Vastuu tarkoittaa, että sinun pitää huolehtia omista tehtävistäsi ja teoistasi.',explanation:'Vastuu tarkoittaa, että huolehdit siitä, mitä teet.',translatedWord:'بەرپرسیارێتی',exampleFinnish:'Oppilaalla on vastuu omista tavaroistaan.',exampleTranslated:'',emoji:'🙌',imageSearch:'vastuu huolehtiminen',nuance:'Vastuu voi tarkoittaa myös velvollisuutta vastata jostakin asiasta.'},
  'yhdenvertaisuus':{simpleFinnish:'Kaikki ihmiset ovat yhtä arvokkaita. Kaikkia pitää kohdella reilusti.',explanation:'Kaikki ihmiset ovat yhtä arvokkaita.',translatedWord:'یەکسانی',exampleFinnish:'Kaikilla oppilailla on oikeus yhdenvertaiseen kohteluun.',exampleTranslated:'',emoji:'🤝',imageSearch:'yhdenvertaisuus',nuance:''},
  'demokratia':{simpleFinnish:'Ihmiset saavat vaikuttaa yhteisiin päätöksiin esimerkiksi äänestämällä.',explanation:'Ihmiset saavat vaikuttaa yhteisiin päätöksiin.',translatedWord:'دیموکراسی',exampleFinnish:'Demokratiassa kansalaiset äänestävät vaaleissa.',exampleTranslated:'',emoji:'🗳️',imageSearch:'demokratia äänestäminen',nuance:''},
  'ilmastonmuutos':{simpleFinnish:'Maapallon ilmasto muuttuu ja lämpenee. Ihmisten toiminta on tärkein syy nykyiseen lämpenemiseen.',explanation:'Maapallon ilmasto lämpenee.',translatedWord:'گۆڕانی کەشوهەوا',exampleFinnish:'Ilmastonmuutos voi lisätä helteitä.',exampleTranslated:'',emoji:'🌍',imageSearch:'ilmastonmuutos maapallo',nuance:''},
  'yhteiskunta':{simpleFinnish:'Ihmiset elävät yhdessä ja sopivat yhteisistä säännöistä ja palveluista.',explanation:'Yhdessä elävät ihmiset ja heidän yhteiset palvelunsa.',translatedWord:'کۆمەڵگا',exampleFinnish:'Koulut ja sairaalat ovat osa yhteiskuntaa.',exampleTranslated:'',emoji:'🏫',imageSearch:'yhteiskunta koulut',nuance:''},
  'osallisuus':{simpleFinnish:'Saat olla mukana, kertoa mielipiteesi ja vaikuttaa asioihin.',explanation:'Saat osallistua ja vaikuttaa.',translatedWord:'بەشداربوون',exampleFinnish:'Oppilaiden osallisuus tarkoittaa, että heitä kuunnellaan.',exampleTranslated:'',emoji:'🙋',imageSearch:'osallisuus oppilaat',nuance:''},
  'yhteistyö':{simpleFinnish:'Ihmiset tekevät jotakin yhdessä ja auttavat toisiaan.',explanation:'Teemme asioita yhdessä.',translatedWord:'هاوکاری',exampleFinnish:'Teimme ryhmätyön yhteistyössä.',exampleTranslated:'',emoji:'🧩',imageSearch:'yhteistyö koulu',nuance:''}
};
const demoOtherLanguages = {
  'englanti': {word:'responsibility', explanation:'Responsibility means taking care of your duties and actions.'},
  'ruotsi': {word:'ansvar', explanation:'Ansvar betyder att du tar hand om dina uppgifter och handlingar.'},
  'arabia': {word:'مسؤولية', explanation:'المسؤولية تعني أن تهتم بواجباتك وأفعالك.'},
  'viro': {word:'vastutus', explanation:'Vastutus tähendab, et hoolitsed oma ülesannete ja tegude eest.'},
  'somali': {word:'mas’uuliyad', explanation:'Mas’uuliyad waa in aad daryeesho waajibaadkaaga iyo ficilladaada.'},
  'kurdisorani': {word:'بەرپرسیارێتی', explanation:'بەرپرسیارێتی واتە ئەوەی ئاگاداری ئەرکەکانت و کردارەکانت بیت.'},
  'suomi': {word:'vastuu', explanation:'Vastuu tarkoittaa, että huolehdit tehtävistäsi ja teoistasi.'}
};
function localDemo(word, explanationLanguage, translationLanguage) {
  const k=word.toLocaleLowerCase('fi-FI').normalize('NFC');
  if(!demo[k])return null;
  if(explanationLanguage==='suomi'&&translationLanguage==='kurdisorani')return {word:k,explanationLanguage,translationLanguage,result:demo[k],demo:true};
  if(k!=='vastuu'||!demoOtherLanguages[explanationLanguage]||!demoOtherLanguages[translationLanguage])return null;
  return {word:k,explanationLanguage,translationLanguage,demo:true,result:{...demo[k],explanation:demoOtherLanguages[explanationLanguage].explanation,translatedWord:demoOtherLanguages[translationLanguage].word}};
}
let active=null, voiceObjectURL=null, audio=null, speechRequest=0;
function optLabel(id){return LANGUAGES.find(([name])=>name===id)?.[1].replace(/\s[🇫🇮]+/gu,'') || id;}
for (const id of ['explanationLanguage','translationLanguage']) {
  const sel=$(id); for (const [v,label] of LANGUAGES) { const o=new Option(label,v);sel.add(o); }
  sel.value=id==='explanationLanguage'?'suomi':'kurdisorani';
  sel.addEventListener('change',()=>{ $(id==='explanationLanguage'?'explanationCustom':'translationCustom').classList.toggle('hidden',sel.value!=='muu'); });
}
function selected(which) {
  const val=$(which+'Language').value;
  return val==='muu' ? $(which+'Custom').value.trim() : val;
}
function label(which){const s=$(which+'Language');return s.value==='muu'?$(which+'Custom').value.trim():optLabel(s.value);}
function speakRequestOptions(){return {'Content-Type':'application/json','x-class-code':$('classCode').value.trim()};}
function alertText(message,error=false){$('status').textContent=message;$('status').classList.remove('hidden');$('status').classList.toggle('error',error);}
function clearMessage(){$('status').classList.add('hidden');$('status').textContent='';}
function rtl(lang){return /sorani|arabia|dari|persia|farsi|urdu|heprea|tigrinja|ckb|ar-|fa-/i.test(lang);}
function putText(id,text,lang){const el=$(id);el.textContent=text||'';el.dir=rtl(lang)?'rtl':'ltr';el.lang=lang==='kurdisorani'?'ckb':(lang==='suomi'?'fi':'');}
for(const word of ['vastuu','yhdenvertaisuus','demokratia','ilmastonmuutos','osallisuus']){
  const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=word;b.addEventListener('click',()=>{$('word').value=word;handleExplain();});$('examples').append(b);
}
function stopAudio(){speechRequest++;if(audio){audio.pause();audio.src='';audio=null;}if(voiceObjectURL){URL.revokeObjectURL(voiceObjectURL);voiceObjectURL=null;}}
function paint(data){stopAudio();const r=data.result;active=data;$('resultWord').textContent=data.word;$('modeBadge').textContent=data.demo?'Esimerkkitila':'Tekoälyn selitys';$('modeBadge').title=data.demo?'Rajattu esimerkkisanasto':'Tekoälyn tuottama, tarkista tarvittaessa';
  putText('simpleFinnish',r.simpleFinnish,'suomi');putText('translatedWord',r.translatedWord,data.translationLanguage);putText('explanation',r.explanation,data.explanationLanguage);
  putText('exampleFinnish',r.exampleFinnish,'suomi');putText('exampleTranslated',r.exampleTranslated,data.explanationLanguage);
  $('exampleTranslated').classList.toggle('hidden',!r.exampleTranslated);
  $('explanationPanel').classList.toggle('hidden',data.explanationLanguage==='suomi');
  $('translatedHeading').textContent='Käännös: '+label('translation');$('explanationHeading').textContent='Selitys: '+label('explanation');
  $('emoji').textContent=r.emoji||'📚';$('emoji').setAttribute('aria-label','Aiheen kuvitus: '+data.word);
  $('nuance').textContent=r.nuance||'Sanan merkitys voi muuttua lauseyhteyden mukaan.';
  $('imageSearch').href='https://commons.wikimedia.org/w/index.php?search='+encodeURIComponent(r.imageSearch||data.word)+'&title=Special:MediaSearch&type=image';
  $('videoSearch').href='https://www.youtube.com/results?search_query='+encodeURIComponent(data.word+' selkokieli');
  $('audioStatus').textContent='';$('result').classList.remove('hidden');$('result').scrollIntoView({behavior:'smooth',block:'start'});
}
async function handleExplain(){
  const word=$('word').value.trim(),explanationLanguage=selected('explanation'),translationLanguage=selected('translation');
  if(!word){alertText('Kirjoita ensin suomenkielinen sana.',true);return;}
  if(!explanationLanguage||!translationLanguage){alertText('Kirjoita valitsemasi kielen nimi.',true);return;}
  clearMessage();$('explainButton').disabled=true;$('explainButton').textContent='Selitän sanaa…';
  try{
    if(location.protocol==='file:')throw new Error('Paikallinen esimerkkiversio');
    const response=await fetch('/api/explain',{method:'POST',headers:speakRequestOptions(),body:JSON.stringify({word,explanationLanguage,translationLanguage})});
    const data=await response.json();if(!response.ok)throw new Error(data?.error||'Selittäminen epäonnistui.');
    paint(data);
  }catch(error){
    const sample=localDemo(word,explanationLanguage,translationLanguage);
    if(sample){
      paint(sample);
      alertText('Näytetään tallennettu esimerkki. Muiden sanojen tekoälyselitys vaatii julkaistun palvelun ja API-avaimen.');
    } else { alertText((error.message||'Selittäminen epäonnistui.')+' Kokeile esimerkkisanoja suomi–sorani-asetuksilla tai sanaa ”vastuu” esimerkiksi ruotsiksi tai englanniksi.',true); }
  }finally{$('explainButton').disabled=false;$('explainButton').textContent='✦ Selitä sana';}
}
async function say(text,language,button){
  if(!text)return;
  stopAudio();const requestID=speechRequest;
  button.disabled=true;$('audioStatus').textContent='Luon ääntä…';
  try{
    if(location.protocol==='file:')throw new Error('Paikallisessa HTML-esikatselussa ei ole puhepalvelua. Julkaise sovellus Netlifyyn ja lisää API-avaimet.');
    const response=await fetch('/api/speak',{method:'POST',headers:speakRequestOptions(),body:JSON.stringify({text,language})});
    if(!response.ok){let msg='Puhepalvelu ei ole vielä käytössä.';try{msg=(await response.json()).error||msg;}catch{}throw new Error(msg);}
    if(requestID!==speechRequest)return;
    const blob=await response.blob();voiceObjectURL=URL.createObjectURL(blob);audio=new Audio(voiceObjectURL);
    audio.onended=()=>{$('audioStatus').textContent='Kuuntelu valmis.';};
    await audio.play();$('audioStatus').textContent='🔊 Ääni soi ('+language+').';
  }catch(e){if(requestID===speechRequest)$('audioStatus').textContent=e.message||'Ääneenluku ei onnistunut.';}
  finally{button.disabled=false;}
}
$('form').addEventListener('submit',e=>{e.preventDefault();handleExplain();});
$('speakFi').addEventListener('click',()=>{if(active)say(active.result.simpleFinnish,'suomi',$('speakFi'));});
$('speakTranslated').addEventListener('click',()=>{if(active)say(active.result.translatedWord,active.translationLanguage,$('speakTranslated'));});
$('speakExplanation').addEventListener('click',()=>{if(active)say(active.result.explanation,active.explanationLanguage,$('speakExplanation'));});
$('word').value='vastuu';
if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('/sw.js').catch(()=>{});
