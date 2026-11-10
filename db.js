require('dotenv').config();
const {Pool}=require('pg');
if(!process.env.DATABASE_URL)throw Error('Configure DATABASE_URL');
module.exports=new Pool({connectionString:process.env.DATABASE_URL});
