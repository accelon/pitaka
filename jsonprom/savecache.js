import {chunkjsfn} from '../utils/index.js'
import {StringByteLength} from '../utils/unicode.js'
class CacheSaver {
    constructor (opts){
        this.log=opts.log||console.log;
        this.name=opts.name;
    }
    async init(){
        this.cache = await caches.open(this.name);
    }
    async writeChunk(chunk,rawcontent){
        const body = rawcontent;
        const contentlength=StringByteLength(rawcontent);
        
        const date=(new Date()).toISOString();
        const res=new Response(body,{status:200,statusText:'OK'
            ,headers:{
                'Content-Type':'application/x-binary',
                'Content-Length': contentlength,
                'Date':date,
                'Last-Modified':date,
                'Cache-Control':'no-store',
                'Vary': 'Accept-Encoding',
            }
        });
	    this.cache.put(chunkjsfn(chunk,this.name),res);  
    }
    async done(){
    }
}
export default CacheSaver;