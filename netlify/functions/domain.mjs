const json=(status,data)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
const DIRECT={com:'https://rdap.verisign.com/com/v1/domain/',net:'https://rdap.verisign.com/net/v1/domain/'};
async function request(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);try{return await fetch(url,{signal:controller.signal,redirect:'follow',headers:{Accept:'application/rdap+json, application/json;q=0.9','User-Agent':'BrandForgeAI/1.1 (domain registration research)'}})}finally{clearTimeout(timer)}}
async function registryBase(tld){const r=await request('https://data.iana.org/rdap/dns.json');if(!r.ok)throw Error('IANA bootstrap unavailable');const data=await r.json();for(const [extensions,urls] of data.services||[]){if(extensions.some(x=>x.toLowerCase()===tld)&&urls.length)return urls[0]}return null}
export async function handler(event){
 const domain=String(event.queryStringParameters?.domain||'').trim().toLowerCase();
 if(!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,20}$/.test(domain))return json(400,{error:'Invalid domain'});
 const tld=domain.split('.').pop();let base=DIRECT[tld];
 try{if(!base){const b=await registryBase(tld);if(b)base=b.replace(/\/?$/,'/')+'domain/';}}
 catch{return json(200,{domain,status:'unknown',note:'Could not locate authoritative registry. Check with a registrar.'})}
 if(!base)return json(200,{domain,status:'unknown',note:'No public RDAP registry endpoint found. Check with a registrar.'});
 try{const r=await request(base+encodeURIComponent(domain));
 if(r.status===404)return json(200,{domain,status:'possibly_available',note:'No registration record found at the registry. Confirm availability with a registrar.'});
 if(r.ok){const data=await r.json().catch(()=>null);if(data?.objectClassName==='domain'||data?.ldhName)return json(200,{domain,status:'registered',note:'Registration confirmed by authoritative registry RDAP.'});return json(200,{domain,status:'unknown',note:'Registry response did not contain a verifiable domain record.'})}
 return json(200,{domain,status:'unknown',note:r.status===403||r.status===429?'Registry blocked or rate-limited the lookup. Check with a registrar.':`Registry returned HTTP ${r.status}. Check with a registrar.`});
 }catch{return json(200,{domain,status:'unknown',note:'Registry lookup timed out or could not be completed. Check with a registrar.'})}
}
