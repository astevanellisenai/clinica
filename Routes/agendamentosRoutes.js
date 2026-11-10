const r=require('express').Router(),db=require('../db'),{decifrar}=require('../lib/cpf');
const {parametros,consultar}=require('../lib/listagem');

r.get('/',async(req,res,next)=>{
 try {
  const ordens={
   data:'a.data_agendamento ASC,a.id ASC',
   data_desc:'a.data_agendamento DESC,a.id DESC',
   pet:'p.nome ASC,a.data_agendamento ASC',
   tutor:'t.nome ASC,a.data_agendamento ASC',
   status:'a.status ASC,a.data_agendamento ASC'
  };
  const q=parametros(req.query,ordens,'data');
  const filtro=['agendado','concluido','cancelado'].includes(q.filtro)?q.filtro:'';
  const values=['%'+q.busca+'%'];
  let where="(p.nome ILIKE $1 OR t.nome ILIKE $1 OR a.descricao ILIKE $1)";
  if(filtro){values.push(filtro);where+=' AND a.status=$'+values.length;}
  if(q.mes){
   values.push(q.mes+'-01');
   where+=" AND a.data_agendamento >= $"+values.length+"::date AND a.data_agendamento < ($"+values.length+"::date + INTERVAL '1 month')";
  }
  const dados=await consultar(db,{
   from:'agendamentos a JOIN pets p ON a.pet_id=p.id JOIN tutores t ON p.tutor_id=t.id',
   where,values,
   select:'a.*,p.nome AS pet_nome,p.especie,p.raca,p.imagem_url,t.nome AS tutor_nome,t.email,t.telefone',
   order:ordens[q.ordem],pagina:q.pagina
  });
  res.render('agendamentos/index',{...dados,...q,filtro,pagina:dados.pagina});
 }catch(e){next(e)}
});
async function formulario(req,res,next,registro={},titulo='Novo agendamento',acao='/agendamentos/novo'){try{const {rows}=await db.query('SELECT p.id,p.nome,t.nome AS tutor_nome FROM pets p JOIN tutores t ON p.tutor_id=t.id ORDER BY t.nome,p.nome');res.render('agendamentos/form',{registro,titulo,acao,pets:rows})}catch(e){next(e)}}
r.get('/novo',(req,res,next)=>formulario(req,res,next));
r.post('/novo',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('INSERT INTO agendamentos(pet_id,data_agendamento,descricao,status) VALUES($1,$2,$3,$4)',[pet_id,data_agendamento,descricao,status]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.get('/editar/:id',async(req,res,next)=>{try{const {rows}=await db.query("SELECT *,to_char(data_agendamento,'YYYY-MM-DD\"T\"HH24:MI') AS data_formatada FROM agendamentos WHERE id=$1",[req.params.id]);if(!rows.length)return res.sendStatus(404);formulario(req,res,next,rows[0],'Editar agendamento','/agendamentos/editar/'+req.params.id)}catch(e){next(e)}});
r.post('/editar/:id',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('UPDATE agendamentos SET pet_id=$1,data_agendamento=$2,descricao=$3,status=$4 WHERE id=$5',[pet_id,data_agendamento,descricao,status,req.params.id]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.post('/excluir/:id',async(req,res,next)=>{try{const result=await db.query('DELETE FROM agendamentos WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.sendStatus(404);res.redirect('/agendamentos')}catch(e){if(e.code==='23503')return res.status(409).send('Não é possível excluir este registro: existem dados relacionados. Volte e remova as dependências primeiro.');next(e)}});
module.exports=r;+values.length;}
 if(q.mes){values.push(q.mes+'-01');where+=' AND a.data_agendamento >= 
async function formulario(req,res,next,registro={},titulo='Novo agendamento',acao='/agendamentos/novo'){try{const {rows}=await db.query('SELECT p.id,p.nome,t.nome AS tutor_nome FROM pets p JOIN tutores t ON p.tutor_id=t.id ORDER BY t.nome,p.nome');res.render('agendamentos/form',{registro,titulo,acao,pets:rows})}catch(e){next(e)}}
r.get('/novo',(req,res,next)=>formulario(req,res,next));
r.post('/novo',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('INSERT INTO agendamentos(pet_id,data_agendamento,descricao,status) VALUES($1,$2,$3,$4)',[pet_id,data_agendamento,descricao,status]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.get('/editar/:id',async(req,res,next)=>{try{const {rows}=await db.query("SELECT *,to_char(data_agendamento,'YYYY-MM-DD\"T\"HH24:MI') AS data_formatada FROM agendamentos WHERE id=$1",[req.params.id]);if(!rows.length)return res.sendStatus(404);formulario(req,res,next,rows[0],'Editar agendamento','/agendamentos/editar/'+req.params.id)}catch(e){next(e)}});
r.post('/editar/:id',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('UPDATE agendamentos SET pet_id=$1,data_agendamento=$2,descricao=$3,status=$4 WHERE id=$5',[pet_id,data_agendamento,descricao,status,req.params.id]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.post('/excluir/:id',async(req,res,next)=>{try{const result=await db.query('DELETE FROM agendamentos WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.sendStatus(404);res.redirect('/agendamentos')}catch(e){if(e.code==='23503')return res.status(409).send('Não é possível excluir este registro: existem dados relacionados. Volte e remova as dependências primeiro.');next(e)}});
module.exports=r;+values.length+'::date AND a.data_agendamento < (
async function formulario(req,res,next,registro={},titulo='Novo agendamento',acao='/agendamentos/novo'){try{const {rows}=await db.query('SELECT p.id,p.nome,t.nome AS tutor_nome FROM pets p JOIN tutores t ON p.tutor_id=t.id ORDER BY t.nome,p.nome');res.render('agendamentos/form',{registro,titulo,acao,pets:rows})}catch(e){next(e)}}
r.get('/novo',(req,res,next)=>formulario(req,res,next));
r.post('/novo',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('INSERT INTO agendamentos(pet_id,data_agendamento,descricao,status) VALUES($1,$2,$3,$4)',[pet_id,data_agendamento,descricao,status]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.get('/editar/:id',async(req,res,next)=>{try{const {rows}=await db.query("SELECT *,to_char(data_agendamento,'YYYY-MM-DD\"T\"HH24:MI') AS data_formatada FROM agendamentos WHERE id=$1",[req.params.id]);if(!rows.length)return res.sendStatus(404);formulario(req,res,next,rows[0],'Editar agendamento','/agendamentos/editar/'+req.params.id)}catch(e){next(e)}});
r.post('/editar/:id',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('UPDATE agendamentos SET pet_id=$1,data_agendamento=$2,descricao=$3,status=$4 WHERE id=$5',[pet_id,data_agendamento,descricao,status,req.params.id]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.post('/excluir/:id',async(req,res,next)=>{try{const result=await db.query('DELETE FROM agendamentos WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.sendStatus(404);res.redirect('/agendamentos')}catch(e){if(e.code==='23503')return res.status(409).send('Não é possível excluir este registro: existem dados relacionados. Volte e remova as dependências primeiro.');next(e)}});
module.exports=r;+values.length+'::date + INTERVAL \'1 month\')';}
 const resultado=await consultar(db,{from:'agendamentos a JOIN pets p ON a.pet_id=p.id JOIN tutores t ON p.tutor_id=t.id',where,values,select:'a.*,p.nome AS pet_nome,p.especie,p.raca,p.imagem_url,t.nome AS tutor_nome,t.email,t.telefone',order:ordens[q.ordem],pagina:q.pagina});
 res.render('agendamentos/index',{...resultado,...q,filtro,pagina:resultado.pagina});
}catch(e){next(e)}});
async function formulario(req,res,next,registro={},titulo='Novo agendamento',acao='/agendamentos/novo'){try{const {rows}=await db.query('SELECT p.id,p.nome,t.nome AS tutor_nome FROM pets p JOIN tutores t ON p.tutor_id=t.id ORDER BY t.nome,p.nome');res.render('agendamentos/form',{registro,titulo,acao,pets:rows})}catch(e){next(e)}}
r.get('/novo',(req,res,next)=>formulario(req,res,next));
r.post('/novo',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('INSERT INTO agendamentos(pet_id,data_agendamento,descricao,status) VALUES($1,$2,$3,$4)',[pet_id,data_agendamento,descricao,status]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.get('/editar/:id',async(req,res,next)=>{try{const {rows}=await db.query("SELECT *,to_char(data_agendamento,'YYYY-MM-DD\"T\"HH24:MI') AS data_formatada FROM agendamentos WHERE id=$1",[req.params.id]);if(!rows.length)return res.sendStatus(404);formulario(req,res,next,rows[0],'Editar agendamento','/agendamentos/editar/'+req.params.id)}catch(e){next(e)}});
r.post('/editar/:id',async(req,res,next)=>{try{const {pet_id,data_agendamento,descricao,status}=req.body;await db.query('UPDATE agendamentos SET pet_id=$1,data_agendamento=$2,descricao=$3,status=$4 WHERE id=$5',[pet_id,data_agendamento,descricao,status,req.params.id]);res.redirect('/agendamentos')}catch(e){next(e)}});
r.post('/excluir/:id',async(req,res,next)=>{try{const result=await db.query('DELETE FROM agendamentos WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.sendStatus(404);res.redirect('/agendamentos')}catch(e){if(e.code==='23503')return res.status(409).send('Não é possível excluir este registro: existem dados relacionados. Volte e remova as dependências primeiro.');next(e)}});
module.exports=r;