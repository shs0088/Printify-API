const taxonomy = [
  {id:'tshirts',source:'T-Shirts',nameEn:'T-Shirts',nameAr:'تيشيرتات',icon:'shirt',active:true,sortOrder:10},
  {id:'hoodies',source:'Hoodies & Sweatshirts',nameEn:'Hoodies & Sweatshirts',nameAr:'هوديز وسويت شيرت',icon:'hoodie',active:true,sortOrder:20},
  {id:'caps',source:'Caps & Hats',nameEn:'Caps & Hats',nameAr:'قبعات',icon:'cap',active:true,sortOrder:30},
  {id:'mugs',source:'Mugs & Drinkware',nameEn:'Mugs & Drinkware',nameAr:'أكواب ومشروبات',icon:'mug',active:true,sortOrder:40},
  {id:'tanks',source:'Tank Tops',nameEn:'Tank Tops',nameAr:'قمصان بدون أكمام',icon:'tank',active:true,sortOrder:50},
  {id:'kids',source:'Kids & Baby',nameEn:'Kids & Baby',nameAr:'أطفال ورضع',icon:'kids',active:true,sortOrder:60},
  {id:'bags',source:'Bags & Totes',nameEn:'Bags & Totes',nameAr:'حقائب وتوت',icon:'bag',active:true,sortOrder:70},
  {id:'other-printables',source:'Other Printables',nameEn:'Other Printables',nameAr:'منتجات طباعة أخرى',icon:'spark',active:true,sortOrder:80},
  {id:'other',source:'Other',nameEn:'Other',nameAr:'أخرى',icon:'grid',active:false,sortOrder:90}
];

module.exports = async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=3600');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  return res.status(200).json({
    ok:true,
    source:'dtf-studio-backend-category-config',
    persistence:'code-config-until-database-is-connected',
    adminReadyFields:['active','sortOrder','nameEn','nameAr','icon','source'],
    categories:taxonomy.sort((a,b)=>a.sortOrder-b.sortOrder)
  });
};