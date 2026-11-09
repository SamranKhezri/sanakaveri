# SANAKAVERI – monikielinen sanaselittäjä

**Valmis asennettava/selaimessa toimiva koululaisten sanaselittäjä, joka tukee tekoälypalvelua.**

- Oppilas kirjoittaa minkä tahansa suomenkielisen sanan tai lyhyen ilmauksen.
- Saa selityksen **aina selkosuomeksi**.
- Valitsee **selityskielen** (oletus suomi) ja **käännöskielen** (oletus kurdisorani).
- Valikoimassa on useita kymmeniä kieliä ja *Muu kieli* -kenttä myös muille kielille.
- Saa esimerkkilauseen, aiheen kuvakkeen sekä kuva- ja videohakulinkit.
- Kuuntelupainikkeet tuottavat äänen palvelimella, **ilman oppilaan laitteeseen asennettavia puheääniä** – kun kyseisen kielen äänen API on kytketty.
- Mobiiliystävällinen ja asennettavissa tuettujen selainten kautta (PWA). Sovelluksen perusnäkymä ja muutama esimerkkisana toimivat myös ilman verkkoyhteyttä.

## Kokeile ennen julkaisua

Avaa **KOKEILE.html** Chrome- tai Edge-selaimessa. Esimerkit `vastuu`, `yhdenvertaisuus`, `demokratia`, `ilmastonmuutos`, `yhteiskunta`, `osallisuus` ja `yhteistyö` toimivat suomi + sorani -asetuksilla ilman avaimia. Voit myös kokeilla sanaa `vastuu` esimerkiksi ruotsiksi, englanniksi, arabiaksi, viroksi ja somaliksi vaihtamalla kielivalintoja. Muut sanat ja äänet tarvitsevat verkossa toimivan palvelimen ja API-avaimet.

## JULKAISE NETTIIN – yksi kokonainen julkaisu

Tätä tekoälyversiota **ei pidä julkaista pelkkänä `public`-kansion staattisena Netlify Drop -sivuna**. Se tarvitsee Netlify Functions -palvelintoiminnot, jotta avaimet eivät näy lapsille.

1. Luo yksityinen tai julkinen tyhjä GitHub-repositorio. Vie sinne **koko tämän projektikansion sisältö**, mukaan lukien `netlify/functions`, `lib`, `public`, `package.json` ja `netlify.toml`. Älä vie `.env`-tiedostoa GitHubiin.
2. Netlify: **Add new project → Import an existing project → GitHub**. Valitse repositorio. Netlify tunnistaa `netlify.toml`-tiedostosta `public`-julkaisukansion ja `netlify/functions`-toiminnot. Julkaise.
3. Netlify: **Project configuration → Environment variables**. Lisää avaimet seuraavan taulukon mukaisesti, ja varmista, että niiden scope sisältää **Functions**. Julkaise uusi deploy muutosten jälkeen. Älä koskaan kirjoita API-avainta HTML:ään tai julkiseen GitHubiin.
4. Saat osoitteen, esimerkiksi `https://OMA-NIMI.netlify.app`. Jaa **oma todellinen Netlify-osoitteesi** lapsille.

Jos haluat tehdä tämän komentoriviltä, Netlify CLI tukee myös rakennettua deployta: `npx netlify deploy --build --prod` tämän kansion juuressa Netlify-kirjautumisen ja projektin linkityksen jälkeen.

## Tarvittavat avaimet

| Netlify-ympäristömuuttuja | Mitä tekee | Pakollinen? |
|---|---|---|
| `OPENAI_API_KEY` | Kaikkien uusien sanojen selitykset ja monien kielten puhe | **Kyllä**, tekoälylle |
| `KURDISH_TTS_API_KEY` | Soranin ja kurmandžin ääni [Kurdish TTS -palvelun kautta](https://www.kurdishtts.com/docs/api) | **Kyllä**, kurdin ääneenluvulle |
| `AZURE_SPEECH_KEY` ja `AZURE_SPEECH_REGION` | Suomalainen `fi-FI-NooraNeural`-ääni ilman selaimen ääniä | **Suositeltu**, laadukkaan suomenkielisen äänen varmistamiseen |
| `CLASS_ACCESS_CODE` | Vapaaehtoinen oppilaiden yhteinen pääsykoodi maksullisen API:n suojaamiseen | Suositeltu julkiselle verkkosivulle |
| `OPENAI_TEXT_MODEL` | Tekstikäännösmalli, oletus `gpt-4.1-mini` | Ei |
| `OPENAI_TTS_MODEL` | Puhemalli, oletus `gpt-4o-mini-tts` | Ei |

**Suomenkielinen ääni:** Kun `AZURE_SPEECH_KEY` ja `AZURE_SPEECH_REGION` on asetettu, suomen ääni tuotetaan suomalaisella Azure Speech `fi-FI-NooraNeural` -äänellä. Muuten käytetään OpenAI:n puhepalvelua, jonka ääni voi kuulostaa vieraskieliseltä – aitoutta ei voi taata.

**Soranin ääni:** `KURDISH_TTS_API_KEY` otetaan erikseen https://www.kurdishtts.com/ → Settings → API. Soranille valitaan `sorani_85` (v3), kurmandžille `kurmanji_6` (v3). Ilman avainta soraninkielinen teksti kyllä näkyy, mutta kuuntelu kertoo puuttuvasta avaimesta. Ilmais-/maksullisen tilin rajat löytyvät palvelun sivuilta.

**Muut kielet:** Tekstikäännöksiä voi pyytää millä tahansa kielellä myös *Muu kieli* -kentässä, mutta tekoälyn kielitaito ja käännösten laatu vaihtelevat. Puheääntä ei ole saatavilla kaikille kielille. Muut tuetut puhekielet käyttävät OpenAI:n Speech API:a. Kaikkia maailman kieliä tai virheetöntä ääntämistä ei siis voi luvata.

**Aikarajoitus / jatkokehitys:** OpenAI on ilmoittanut `gpt-4o-mini-tts`-puhemallin poistuvan käytöstä **6.1.2027**. Uusia integraatioita tulee päivittää sitä ennen Realtime API:n uudempaan puhemalliin tai korvata OpenAI Speech toisella toimittajalla. Tekstiselitys, Azure-suomi ja Kurdish TTS -sorani ovat tästä muutoksesta erillisiä.

## Lapsille ja koululle tärkeää

- Tämä on oppimisen apuväline, ei tarkistettu sanakirja; opettajan kannattaa tarkistaa vaikeat termit, erityisesti harvinaisten kielten käännökset.
- Älä syötä lapsen nimeä, osoitetta, terveystietoja tai muita henkilötietoja. Palvelin välittää sanat/kielen OpenAI:n rajapintaan sekä kuunneltavan tekstin valitun ääntoimittajan rajapintaan.
- Ennen koulujen laajaa käyttöä selvitä GDPR, käsittelysopimukset, opetusorganisaation hyväksyntä ja mahdolliset tietojen siirrot.
- Sovellus ei itse sisällä analytiikkaa tai oppilastilejä. Hosting- ja API-toimittajilla on omat lokinsa/käyttöehtonsa.
- Aseta käyttö- ja kulutusrajat API-toimittajien hallintapaneeleissa ennen kuin jaat sivun julkisesti. `CLASS_ACCESS_CODE` on kevyt pääsyrajoitus, ei vahva käyttäjätunnistus eikä varma suoja väärinkäyttöä vastaan.

## Koodin rakenne

- `public/`: verkkosivu + PWA-tiedostot
- `netlify/functions/explain.mjs`: tekoälyn selitykset, palvelin säilyttää avaimen
- `netlify/functions/speak.mjs`: puhepalvelut
- `lib/common.mjs`: apufunktiot
- `tests/`: paikalliset mockatut testit (`npm test`)

## Kehittäjätesti

```sh
npm test
npx netlify dev
```

Netlify Dev tukee paikallisia Functions-reittejä. Lisää omat avaimet `.env`-tiedostoon paikallisesti; **älä koskaan julkaise `.env`-tiedostoa**. Testit varmistavat palvelun logiikkaa ja vastausrakenteita mockkien avulla, mutta eivät todista ulkoisten puhepalvelujen äänenlaatua tai valmiutta ilman oikeita API-avaimia.
