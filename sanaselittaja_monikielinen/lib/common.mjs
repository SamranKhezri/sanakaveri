export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff'}
  });
}
export async function parseInput(request, maxBytes = 3500) {
  if (request.method !== 'POST') throw Object.assign(new Error('Käytä POST-pyyntöä.'), {status:405});
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw Object.assign(new Error('Virheellinen pyyntötyyppi.'), {status:415});
  const input = await request.text();
  if (input.length > maxBytes) throw Object.assign(new Error('Pyyntö on liian pitkä.'), {status:413});
  try { return JSON.parse(input); } catch { throw Object.assign(new Error('Virheellinen JSON.'), {status:400}); }
}
export function authorize(request) {
  const code = process.env.CLASS_ACCESS_CODE;
  if (code && request.headers.get('x-class-code') !== code) throw Object.assign(new Error('Luokan pääsykoodi puuttuu tai on virheellinen.'), {status:401});
}
export function validateLanguage(s, fallback) {
  const v = String(s || fallback).trim();
  if (v.length < 2 || v.length > 64 || /[<>\x00-\x1f{}]/.test(v)) throw Object.assign(new Error('Valitse kelvollinen kieli.'), {status:400});
  return v;
}
export function getErrorStatus(e) { return e?.status && Number.isInteger(e.status) ? e.status : 502; }
export function friendlyUpstream(status, service) {
  if (status === 401 || status === 403) return `${service}: tarkista API-avain tai käyttöoikeudet.`;
  if (status === 429) return `${service}: käyttöraja täyttyi. Kokeile myöhemmin.`;
  return `${service} ei vastannut oikein (HTTP ${status}).`;
}
export async function fetchTimed(url, options, ms = 18000) {
  return fetch(url, {...options, signal: AbortSignal.timeout(ms)});
}
