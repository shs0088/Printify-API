function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function classify(title='') {
  const s=String(title).toLowerCase();
  if (/mug|tumbler|cup|bottle|can cooler|travel mug/.test(s)) return ['Mugs & Drinkware', /tumbler/.test(s)?'Tumblers':/bottle/.test(s)?'Bottles':/travel/.test(s)?'Travel Mugs':'Mugs'];
  if (/hoodie|sweatshirt|sweater/.test(s)) return ['Hoodies & Sweatshirts', /zip/.test(s)?'Zip Hoodies':/sweatshirt|sweater/.test(s)?'Sweatshirts':'Hoodies'];
  if (/cap|hat|beanie|visor|bucket/.test(s)) return ['Caps & Hats', /beanie/.test(s)?'Beanies':/bucket/.test(s)?'Bucket Hats':/trucker/.test(s)?'Trucker Caps':/snapback/.test(s)?'Snapbacks':'Caps'];
  if (/tank|racerback/.test(s)) return ['Tank Tops', /women|womens|woman|racerback/.test(s)?"Women's Tanks":'Unisex Tanks'];
  if (/baby|infant|toddler|kids|youth|bodysuit/.test(s)) return ['Kids & Baby', /baby|infant|bodysuit/.test(s)?'Baby':/toddler/.test(s)?'Toddler':'Youth & Kids'];
  if (/tote|bag|backpack/.test(s)) return ['Bags & Totes', /tote/.test(s)?'Tote Bags':/backpack/.test(s)?'Backpacks':'Other Bags'];
  if (/tee|t-shirt|shirt/.test(s)) return ['T-Shirts', /women|womens|woman|ladies|female/.test(s)?"Women's T-Shirts":/men|mens|male/.test(s)?"Men's T-Shirts":/youth|kids|child/.test(s)?'Kids T-Shirts':'Unisex T-Shirts'];
  if (/poster|canvas|sticker|phone case|pillow|blanket|wall/.test(s)) return ['Other Printables', /poster|canvas|wall/.test(s)?'Wall Art':/phone case/.test(s)?'Phone Cases':/sticker/.test(s)?'Stickers':'Home & Living'];
  return ['Other','Other'];
}
module.exports = async function handler(req,res){
  cors(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const token=process.env.PRINTIFY_API_TOKEN;
    const headers={Accept:'application/json','User-Agent':'DTF-Studio-Printify-Bridge/2.0'};
    if(token) headers.Authorization=`Bearer ${token}`;
    const upstream=await fetch('https://api.printify.com/v1/catalog/blueprints.json',{headers});
    const text=await upstream.text(); let data={};
    try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
    if(!upstream.ok) return res.status(upstream.status).json({ok:false,error:'Printify catalog request failed',details:data});
    const items=Array.isArray(data)?data:[];
    const products=items.map(p=>{
      const [category,subcategory]=classify(p.title||'');
      return {
        id:p.id,title:p.title||'',description:p.description||'',brand:p.brand||'',model:p.model||'',
        image:Array.isArray(p.images)&&p.images.length?p.images[0]:'',
        images:Array.isArray(p.images)?p.images:[],
        category,subcategory
      };
    });
    return res.status(200).json({ok:true,source:'printify-catalog',total:products.length,products});
  }catch(e){return res.status(500).json({ok:false,error:'Failed to reach Printify',message:e instanceof Error?e.message:String(e)})}
};