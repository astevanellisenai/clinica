const r=require('express').Router(),db=require('../db'),{cifrar,decifrar}=require('../lib/cpf');
const {parametros,consultar}=require('../lib/listagem');
r.get('/',async(req,res,next)=>{try{
 const ordens={nome:'nome ASC, id ASC',nome_desc:'nome DESC, id DESC',id:'id ASC',id_desc:'id DESC',email:'email ASC, id ASC'};
 const q=parametros(req.query,ordens,'nome');
 const resultado=await consultar(db,{from:'tutores',where:'(nome ILIKE $1 OR email ILIKE $1 OR COALESCE(telefone,\'\') ILIKE $1)',values:['%'+q.busca+'%'],order:ordens[q.ordem],pagina:q.pagina});
 res.render('tutores/index',{...resultado,registros:resultado.registros.map(x=>({...x,cpf:decifrar(x.cpf_criptografado)})),...q,pagina:resultado.pagina});
}catch(e){next(e)}});
r.get('/novo',(req,res)=>res.render('tutores/form',{registro:{},titulo:'Novo tutor',acao:'/tutores/novo'}));
r.post('/novo',async(req,res,next)=>{try{const {nome,email,telefone,cpf}=req.body;await db.query('INSERT INTO tutores(nome,email,telefone,cpf_criptografado) VALUES($1,$2,$3,$4)',[nome,email,telefone,cifrar(cpf)]);res.redirect('/tutores')}catch(e){next(e)}});
r.get('/editar/:id',async(req,res,next)=>{try{const {rows}=await db.query('SELECT * FROM tutores WHERE id=$1',[req.params.id]);if(!rows.length)return res.sendStatus(404);res.render('tutores/form',{registro:{...rows[0],cpf:decifrar(rows[0].cpf_criptografado)},titulo:'Editar tutor',acao:'/tutores/editar/'+req.params.id})}catch(e){next(e)}});
r.post('/editar/:id',async(req,res,next)=>{try{const {nome,email,telefone,cpf}=req.body;await db.query('UPDATE tutores SET nome=$1,email=$2,telefone=$3,cpf_criptografado=$4 WHERE id=$5',[nome,email,telefone,cifrar(cpf),req.params.id]);res.redirect('/tutores')}catch(e){next(e)}});
r.post('/excluir/:id',async(req,res,next)=>{try{const result=await db.query('DELETE FROM tutores WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.sendStatus(404);res.redirect('/tutores')}catch(e){if(e.code==='23503')return res.status(409).send('Não é possível excluir este registro: existem dados relacionados. Volte e remova as dependências primeiro.');next(e)}});
module.exports=r;