const json=(status,data)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
export async function handler(event){
 const domain=String(event.queryStringParameters?.domain||'').toLowerCase();if(!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,20}$/.test(domain))return json(400,{error:'Invalid domain'});
 // DNS cannot prove availability. RDAP 404 can indicate no registration; some registries block RDAP or respond inconsistently.
 try{const t=new AbortController();const timer=setTimeout(()=>t.abort(),7500);let r;try{r=await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`,{signal:t.signal,headers:{Accept:'application/rdap+json'}})}finally{clearTimeout(timer)}
 if(r.status===404)return json(200,{domain,status:'possibly_available',note:'No registration found by RDAP. Confirm with a registrar before purchasing.'});
 if(r.ok)return json(200,{domain,status:'registered',note:'RDAP indicates an existing registration.'});
 return json(200,{domain,status:'unknown',note:`RDAP returned HTTP ${r.status}. Verify with a registrar.`});
 }catch{return json(200,{domain,status:'unknown',note:'Registry lookup unavailable. Verify with a registrar.'})}
}
