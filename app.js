require('dotenv').config();
const express=require('express'),session=require('express-session'),bcrypt=require('bcryptjs'),crypto=require('node:crypto'),db=require('./db'),app=express();
if (!process.env.SESSION_SECRET) throw Error('Configure SESSION_SECRET no .env');
if (process.env.NODE_ENV === 'production' && process.env.SESSION_SECRET.length < 32)
  throw Error('Em produção, SESSION_SECRET deve ter 32+ caracteres');
app.set('view engine','ejs');app.use(express.static('Public'));app.use(express.urlencoded({extended:false}));
app.use(session({name:'clinica.sid',secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:30*60*1000}}));
app.use((req,res,next)=>{if(!req.session.csrf)req.session.csrf=crypto.randomBytes(24).toString('hex');res.locals.csrf=req.session.csrf;res.locals.usuario=req.session.usuario||null;
if(req.method==='POST'){const x=String(req.body._csrf||''),y=req.session.csrf;if(x.length!==y.length||!crypto.timingSafeEqual(Buffer.from(x),Buffer.from(y)))return res.status(403).send('CSRF inválido');}next()});
const login=(req,res,next)=>req.session.usuario?next():res.redirect('/login');
app.get('/',(req,res)=>res.redirect(req.session.usuario?'/dashboard':'/login'));
app.get('/login',(req,res)=>res.render('login',{erro:null}));
app.post('/login',async(req,res,next)=>{try{const {rows}=await db.query('SELECT id,nome,email,senha_hash FROM usuarios WHERE email=$1 AND situacao=1',[String(req.body.email||'').trim().toLowerCase()]);const u=rows[0];if(!u||!await bcrypt.compare(String(req.body.senha||''),u.senha_hash))return res.status(401).render('login',{erro:'E-mail ou senha inválidos'});req.session.regenerate(err=>{if(err)return next(err);req.session.usuario={id:u.id,nome:u.nome,email:u.email};req.session.csrf=crypto.randomBytes(24).toString('hex');res.redirect('/dashboard')})}catch(e){next(e)}});
app.post('/logout',login,(req,res,next)=>req.session.destroy(e=>e?next(e):res.redirect('/login')));
app.get('/dashboard',login,async(req,res,next)=>{try{const rs=await Promise.all(['tutores','pets','agendamentos'].map(t=>db.query('SELECT count(*) AS total FROM '+t)));res.render('dashboard',{quantidades:rs.map(r=>r.rows[0].total)})}catch(e){next(e)}});
for(const nome of ['tutores','pets','agendamentos'])app.use('/'+nome,login,require('./Routes/'+nome+'Routes'));
app.use((err,req,res,next)=>{console.error(err);res.status(500).send('Erro interno no servidor')});
app.listen(Number(process.env.PORT||3001),()=>console.log('Clínica: http://localhost:'+(process.env.PORT||3001)));