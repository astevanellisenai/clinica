const crypto=require('node:crypto');
function key(){const h=process.env.CPF_ENCRYPTION_KEY||'';if(!/^[0-9a-fA-F]{64}$/.test(h))throw Error('CPF_ENCRYPTION_KEY: 64 caracteres hex');return Buffer.from(h,'hex')}
function normal(cpf){const x=String(cpf||'').replace(/\D/g,'');if(!/^\d{11}$/.test(x))throw Error('CPF deve conter 11 dígitos');return x}
function cifrar(cpf){const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',key(),iv);const bytes=Buffer.concat([c.update(normal(cpf),'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),bytes]).toString('base64')}
function decifrar(cpf){const v=Buffer.from(cpf,'base64'),d=crypto.createDecipheriv('aes-256-gcm',key(),v.subarray(0,12));d.setAuthTag(v.subarray(12,28));return d.update(v.subarray(28),undefined,'utf8')+d.final('utf8')}
module.exports={cifrar,decifrar};