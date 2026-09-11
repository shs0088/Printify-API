function cors(res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
module.exports=async function handler(req,res){
  cors(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  const token=process.env.PRINTIFY_API_TOKEN;
  if(!token) return res.status(500).json({ok:false,error:'PRINTIFY_API_TOKEN is not configured on the server'});
  const body=req.body||{};
  const fileName=String(body.fileName||'dtf-preview.png').replace(/[^\w.\-]+/g,'_').slice(0,120);
  const payload={file_name:fileName};
  if(body.url) payload.url=String(body.url);
  else if(body.contents) payload.contents=String(body.contents).replace(/^data:[^;]+;base64,/,'');
  else return res.status(400).json({ok:false,error:'url or base64 contents is required'});
  try{
    const r=await fetch('https://api.printify.com/v1/uploads/images.json',{
      method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Content-Type':'application/json','User-Agent':'DTF-Studio-Printify-Bridge/2.0'},
      body:JSON.stringify(payload)
    });
    const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
    if(!r.ok) return res.status(r.status).json({ok:false,error:'Printify upload failed',details:data});
    return res.status(200).json({ok:true,image:data});
  }catch(e){return res.status(500).json({ok:false,error:'Failed to reach Printify',message:e instanceof Error?e.message:String(e)})}
};