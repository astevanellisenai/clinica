// Pesquisa, ordenação e paginação SQL reutilizáveis (padrão da Aula 12 / Eventos).
const LIMITE=5;
function parametros(query,ordens,ordemPadrao){
 const busca=String(query.busca||'').trim().slice(0,120);
 const ordem=Object.hasOwn(ordens,query.ordem)?query.ordem:ordemPadrao;
 const filtro=String(query.filtro||'').trim();
 const mes=/^\d{4}-\d{2}$/.test(String(query.mes||''))?String(query.mes):'';
 const n=Number(query.pagina);
 const pagina=Number.isSafeInteger(n)&&n>0?n:1;
 return {busca,ordem,filtro,mes,pagina};
}
async function consultar(db,{from,where='TRUE',values=[],select='*',order='id ASC',pagina=1}){
 const count=await db.query('SELECT COUNT(*)::int AS total FROM '+from+' WHERE '+where,values);
 const totalRegistros=count.rows[0].total;
 const totalPaginas=Math.max(1,Math.ceil(totalRegistros/LIMITE));
 const atual=Math.min(pagina,totalPaginas);
 const args=[...values,LIMITE,(atual-1)*LIMITE];
 const dados=await db.query('SELECT '+select+' FROM '+from+' WHERE '+where+' ORDER BY '+order+' LIMIT $'+(values.length+1)+' OFFSET $'+(values.length+2),args);
 return {registros:dados.rows,pagina:atual,totalPaginas,totalRegistros,limite:LIMITE};
}
module.exports={parametros,consultar};
