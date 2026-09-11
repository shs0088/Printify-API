function cors(res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
async function pf(path){
  const token=process.env.PRINTIFY_API_TOKEN;
  if(!token) throw new Error('PRINTIFY_API_TOKEN is not configured on the server');
  const r=await fetch(`https://api.printify.com/v1/${path}`,{headers:{
    Authorization:`Bearer ${token}`,Accept:'application/json','User-Agent':'DTF-Studio-Printify-Bridge/2.0'
  }});
  const text=await r.text(); let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!r.ok){const err=new Error('Printify API request failed'); err.status=r.status; err.details=data; throw err}
  return data;
}
module.exports=async function handler(req,res){
  cors(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  const blueprintId=String(req.query?.blueprintId||'').trim();
  const providerId=String(req.query?.providerId||'').trim();
  if(!blueprintId) return res.status(400).json({ok:false,error:'blueprintId is required'});
  try{
    const [blueprint,providers]=await Promise.all([
      pf(`catalog/blueprints/${encodeURIComponent(blueprintId)}.json`),
      pf(`catalog/blueprints/${encodeURIComponent(blueprintId)}/print_providers.json`)
    ]);
    let variants=null;
    if(providerId){
      variants=await pf(`catalog/blueprints/${encodeURIComponent(blueprintId)}/print_providers/${encodeURIComponent(providerId)}/variants.json`);
    }
    return res.status(200).json({ok:true,blueprint,providers:Array.isArray(providers)?providers:[],variants});
  }catch(e){
    return res.status(e.status||500).json({ok:false,error:e.message||'Printify request failed',details:e.details||null});
  }
};