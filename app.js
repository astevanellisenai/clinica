require('dotenv').config();
const express=require('express'),session=require('express-session'),bcrypt=require('bcryptjs'),crypto=require('node:crypto'),db=require('./db'),app=express();
if (!process.env.SESSION_SECRET) throw Error('Configure SESSION_SECRET no .env');
if (process.env.NODE_ENV === 'production' && process.env.SESSION_SECRET.length < 32)
  throw Error('Em produção, SESSION_SECRET deve ter 32+ caracteres');
app.set('view engine','ejs');app.use(express.static('Public'));
// Multipart precisa ser processado antes da verificação CSRF.
const uploadPet = require('./lib/uploadPet');
app.use(session({name:'clinica.sid',secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:30*60*1000}}));
app.use(express.urlencoded({extended:false}));
app.use('/pets',(req,res,next)=>{
 if(req.method !== 'POST') return next();
 if(!req.session.usuario) return res.redirect('/login');
 uploadPet.single('imagem')(req,res,next);
});
app.use((req,res,next)=>{if(!req.session.csrf)req.session.csrf=crypto.randomBytes(24).toString('hex');res.locals.csrf=req.session.csrf;res.locals.usuario=req.session.usuario||null;
if(req.method==='POST'){const x=String(req.body._csrf||''),y=req.session.csrf;if(x.length!==y.length||!crypto.timingSafeEqual(Buffer.from(x),Buffer.from(y)))return res.status(403).send('CSRF inválido');}next()});
const login=(req,res,next)=>req.session.usuario?next():res.redirect('/login');
app.get('/',(req,res)=>req.session.usuario ? res.redirect('/dashboard') : res.render('landing/index'));
app.get('/login',(req,res)=>res.render('login',{erro:null}));
app.post('/login',async(req,res,next)=>{try{const {rows}=await db.query('SELECT id,nome,email,senha_hash FROM usuarios WHERE email=$1 AND situacao=1',[String(req.body.email||'').trim().toLowerCase()]);const u=rows[0];if(!u||!await bcrypt.compare(String(req.body.senha||''),u.senha_hash))return res.status(401).render('login',{erro:'E-mail ou senha inválidos'});req.session.regenerate(err=>{if(err)return next(err);req.session.usuario={id:u.id,nome:u.nome,email:u.email};req.session.csrf=crypto.randomBytes(24).toString('hex');res.redirect('/dashboard')})}catch(e){next(e)}});
app.post('/logout',login,(req,res,next)=>req.session.destroy(e=>e?next(e):res.redirect('/login')));
app.get('/dashboard',login,async(req,res,next)=>{
 try {
   const [tutores,pets,agendamentos,proximos,status]=await Promise.all([
     db.query('SELECT COUNT(*)::int total FROM tutores'),
     db.query('SELECT COUNT(*)::int total FROM pets'),
     db.query('SELECT COUNT(*)::int total FROM agendamentos'),
     db.query("SELECT a.id,a.data_agendamento,a.descricao,a.status,p.nome AS pet_nome,p.imagem_url,t.nome AS tutor_nome FROM agendamentos a JOIN pets p ON a.pet_id=p.id JOIN tutores t ON p.tutor_id=t.id WHERE a.data_agendamento >= CURRENT_TIMESTAMP AND a.status='agendado' ORDER BY a.data_agendamento LIMIT 5"),
     db.query('SELECT status,COUNT(*)::int total FROM agendamentos GROUP BY status')
   ]);
   res.render('dashboard',{quantidades:[tutores.rows[0].total,pets.rows[0].total,agendamentos.rows[0].total],proximos:proximos.rows,status:status.rows});
 }catch(e){next(e)}
});
for(const nome of ['tutores','pets','agendamentos'])app.use('/'+nome,login,require('./Routes/'+nome+'Routes'));
app.use((err,req,res,next)=>{console.error(err);res.status(500).send('Erro interno no servidor')});
app.listen(Number(process.env.PORT||3001),()=>console.log('Clínica: http://localhost:'+(process.env.PORT||3001)));