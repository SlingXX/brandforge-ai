const styles=['Premium','Modern','Invented','Minimal','Playful','Technical'];
const json=(status,data)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
export async function handler(event){
 if(event.httpMethod!=='POST')return json(405,{error:'POST required'});
 let body;try{body=JSON.parse(event.body||'{}')}catch{return json(400,{error:'Invalid JSON'})}
 const description=String(body.description||'').trim().slice(0,1200),industry=String(body.industry||'').slice(0,100),style=styles.includes(body.style)?body.style:'Modern';
 if(description.length<8)return json(400,{error:'Describe your business in at least 8 characters.'});
 if(!process.env.OPENAI_API_KEY)return json(503,{error:'Set OPENAI_API_KEY in Netlify environment variables to enable AI generation.'});
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),24000);
 try{
 const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',temperature:0.9,response_format:{type:'json_object'},messages:[{role:'system',content:'You are a professional naming strategist. Return only JSON object with names array of 12 objects. Each object must have name, tagline, rationale, category, and scores object with memorability, pronunciation, distinctiveness, brandPotential integers 1-100. Propose pronounceable, varied names. Do not claim any domain or trademark is available; do not claim legal clearance. Scores are subjective creative heuristics.'},{role:'user',content:JSON.stringify({description,industry,style})}]})});
 const data=await res.json();if(!res.ok)return json(502,{error:'AI provider error',detail:data.error?.message||res.statusText});
 const parsed=JSON.parse(data.choices?.[0]?.message?.content||'{}');const names=(Array.isArray(parsed.names)?parsed.names:[]).slice(0,20).filter(x=>typeof x.name==='string').map(x=>({name:x.name.slice(0,80),tagline:String(x.tagline||'').slice(0,160),rationale:String(x.rationale||'').slice(0,400),category:String(x.category||style).slice(0,50),scores:Object.fromEntries(['memorability','pronunciation','distinctiveness','brandPotential'].map(k=>[k,Math.min(100,Math.max(1,Number(x.scores?.[k])||50))]))}));return json(200,{names});
 }catch(e){return json(502,{error:e.name==='AbortError'?'AI request timed out':'AI generation failed'})}finally{clearTimeout(timer)}
}
