const multer=require('multer');
const path=require('node:path');
const fs=require('node:fs');
const crypto=require('node:crypto');
const dir=path.join(__dirname,'..','Public','img','pets');
fs.mkdirSync(dir,{recursive:true});
const ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'};
const storage=multer.diskStorage({
 destination:(req,file,cb)=>cb(null,dir),
 filename:(req,file,cb)=>cb(null,crypto.randomUUID()+ext[file.mimetype])
});
module.exports=multer({
 storage,
 limits:{fileSize:3*1024*1024,files:1},
 fileFilter:(req,file,cb)=>ext[file.mimetype]?cb(null,true):cb(new Error('Imagem inválida: use JPG, PNG ou WebP'))
});
