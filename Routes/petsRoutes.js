const r=require('express').Router(),db=require('../db');
const fs=require('node:fs/promises'),path=require('node:path');
const apagar=async nome=>{
 if(!nome)return;
 const file=path.join(__dirname,'..','Public','img','pets',path.basename(nome));
 try{await fs.unlink(file)}catch(e){if(e.code!=='ENOENT')console.warn('Falha ao apagar imagem antiga',e)}
};
r.get('/',async(req,res,next)=>{
 try{const {rows}=await db.query('SELECT p.*,t.nome tutor_nome FROM pets p JOIN tutores t ON p.tutor_id=t.id ORDER BY p.nome');
 res.render('pets/index',{registros:rows})}catch(e){next(e)}
});
async function formulario(req,res,next,registro={},titulo='Novo pet',acao='/pets/novo'){
 try{const {rows}=await db.query('SELECT id,nome FROM tutores ORDER BY nome');
 res.render('pets/form',{registro,titulo,acao,tutores:rows})}catch(e){next(e)}
}
r.get('/novo',(req,res,next)=>formulario(req,res,next));
r.post('/novo',async(req,res,next)=>{
 try{const {nome,especie,raca,tutor_id}=req.body;
 await db.query('INSERT INTO pets(nome,especie,raca,tutor_id,imagem_url) VALUES($1,$2,$3,$4,$5)',
 [nome,especie,raca,tutor_id,req.file?.filename||null]);
 res.redirect('/pets')}catch(e){if(req.file)await apagar(req.file.filename);next(e)}
});
r.get('/editar/:id',async(req,res,next)=>{
 try{const {rows}=await db.query('SELECT * FROM pets WHERE id=$1',[req.params.id]);
 if(!rows.length)return res.sendStatus(404);
 formulario(req,res,next,rows[0],'Editar pet','/pets/editar/'+req.params.id)}catch(e){next(e)}
});
r.post('/editar/:id',async(req,res,next)=>{
 try{
 const {nome,especie,raca,tutor_id}=req.body;
 const atual=await db.query('SELECT imagem_url FROM pets WHERE id=$1',[req.params.id]);
 if(!atual.rows.length){if(req.file)await apagar(req.file.filename);return res.sendStatus(404)}
 const anterior=atual.rows[0].imagem_url;
 const nova=req.file?.filename||anterior;
 await db.query('UPDATE pets SET nome=$1,especie=$2,raca=$3,tutor_id=$4,imagem_url=$5 WHERE id=$6',
 [nome,especie,raca,tutor_id,nova,req.params.id]);
 if(req.file && anterior)await apagar(anterior);
 res.redirect('/pets');
 }catch(e){if(req.file)await apagar(req.file.filename);next(e)}
});
module.exports=r;
