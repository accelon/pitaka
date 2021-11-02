import ZipSaver from './savezip.js';
import JsonpSaver from './savejsonp.js';
import CacheSaver from './savecache.js';
import RawSaver from './saveraw.js';
import {chunkjsfn} from '../utils/index.js';
const escapeTemplateString=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');

const prepareJSONP=({chunk,name,start},lines)=>{
    return 'jsonp('+chunk+',{"name":"'+name+'","start":'+start
    +'},`'+escapeTemplateString(lines.join('\n'))+'`)';
}

const saveHeader=async (saver,header,payload)=>{ 
    if (saver instanceof RawSaver) return;   
    await saver.writeChunk('jsonp(0,'+JSON.stringify(header)+',`'
    +escapeTemplateString(payload)+'`)',0);
    //do not compress header, need to load as fast as possible
}

const saveJsonp=async(saver,chunk,name,start,L,compress=false)=>{
    let writeCount=0;
    
    const newcontent=prepareJSONP({chunk,name,start},L);
    if (saver instanceof JsonpSaver ) { //need node js
        const fn=chunkjsfn(chunk,name);
        //write only touched file
        if (!fs.existsSync(fn) || fs.readFileSync(fn,'utf8')!==newcontent) {
            await saver.writeChunk(newcontent,chunk);
            writeCount++;
        }
    } else {
        if (saver instanceof RawSaver) {
            await saver.writeChunk(L.join('\n'),chunk);
        } else {
            await saver.writeChunk(newcontent,chunk,compress);
        }
        writeCount++;
    }
    return writeCount;
}

async function save(opts,extraheader={}){
    opts=Object.assign({},opts,this.opts);
    let saver=null;
    const header=Object.assign({},extraheader,this.header);
    const {chunkStarts}=header;
    if (opts.jsonp) {
        saver=new JsonpSaver({name:opts.name,log:this.log});       
    } else if (opts.cache) {
        saver=new CacheSaver({name:opts.name,log:this.log});
    } else if (opts.raw) {
        saver=new RawSaver({name:opts.name,log:this.log,context:this.context});
    } else {
        saver=new ZipSaver({name:opts.name,file:opts.file,log:this.log});
    }
    await saver.init();

    this.payload=opts.payload||'';
    if (typeof this.payload!=='string') this.payload=this.payload.join('\n');
    await saveHeader(saver,header,this.payload);

    let i=1,filecount=1,compress;
    const name=opts.name;
    while (i<chunkStarts.length) {
        const L=this._lines.slice( chunkStarts[i-1],chunkStarts[i]);
        //do not deflate labels and postings, speed up loading 100%
        compress=this.nocompressline > chunkStarts[i-1]+L.length; 
        filecount+=await saveJsonp(saver,i,name,chunkStarts[i-1],L,compress)
        i++;
    }
    const start=chunkStarts[chunkStarts.length-1];
    const lastpart=this._lines.slice(start,this._lines.length);
    compress=this.nocompressline > chunkStarts[i-1]+lastpart.length; 

    filecount+=await saveJsonp(saver,chunkStarts.length, name, start,lastpart ,compress)

    const rep={};
    rep.Number_of_chunk=chunkStarts.length+1;
    rep.written_files=filecount;

    await saver.done();
    return rep;
}
export default save;