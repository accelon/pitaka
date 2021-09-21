import ZipSaver from './savezip.js';
import JsonpSaver from './savejsonp.js';
import CacheSaver from './savecache.js';
import {chunkjsfn} from '../utils/index.js';
const escapeTemplateString=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');

const prepareJSONP=({chunk,name,start},lines)=>{
    return 'jsonp('+chunk+',{"name":"'+name+'","start":'+start
    +'},`'+escapeTemplateString(lines.join('\n'))+'`)';
}

const saveHeader=async (saver,header,payload)=>{    
    await saver.writeChunk(0,'jsonp(0,'+JSON.stringify(header)+',`'
    +escapeTemplateString(payload)+'`)','utf8');
}

const saveJsonp=async(saver,chunk,name,start,L)=>{
    let writeCount=0;
    const newcontent=prepareJSONP({chunk,name,start},L);
    
    if (saver instanceof JsonpSaver ) {
        const fn=saver.folder+'/'+ chunkjsfn(chunk);
        //write only touched file
        if (!fs.existsSync(fn) || fs.readFileSync(fn,'utf8')!==newcontent) {
            await saver.writeChunk(chunk,newcontent);
            writeCount++;
        }
    } else {
        await saver.writeChunk(chunk,newcontent);
        writeCount++;
    }
    return writeCount;
}

async function save(opts,extraheader={}){
    opts=Object.assign({},opts,this.opts);
    const folder=(opts.folder||opts.name);
    let saver=null;
    const header=Object.assign({},extraheader,this.header);
    const {chunkStarts}=header;
    if (opts.jsonp) {
        saver=new JsonpSaver({folder,name:opts.name,log:this.log});       
    } else if (opts.cache) {
        saver=new CacheSaver({folder,name:opts.name,log:this.log});
    } else {
        saver=new ZipSaver({folder,name:opts.name,file:opts.file,log:this.log});
    }
    await saver.init();

    this.payload=opts.payload||'';
    if (typeof this.payload!=='string') this.payload=this.payload.join('\n');
    await saveHeader(saver,header,this.payload);

    let i=1,wc=1;
    const name=opts.name;
    while (i<chunkStarts.length) {
        const L=this._lines.slice( chunkStarts[i-1],chunkStarts[i]);
        wc+=await saveJsonp(saver,i,name,chunkStarts[i-1],L)
        i++;
    }
    const start=chunkStarts[chunkStarts.length-1];
    const last=this._lines.slice(start,this._lines.length);
    wc+=await saveJsonp(saver,chunkStarts.length, name, start,last )

    const rep={};
    rep.Number_of_chunk=chunkStarts.length+1;
    rep.written_files=wc;

    await saver.done();
    return rep;
}
export default save;