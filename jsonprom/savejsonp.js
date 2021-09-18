//import {readFileSync,writeFileSync,existsSync,writeSync,mkdirSync,close, appendFileSync} from 'fs'
import { ROMHEADERSIZE,EMPTYROMHEADER } from '../rom/romconst.js';

const escapeTemplateString=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');

const prepareJSONP=({chunk,name,start},lines)=>{
    return 'jsonp('+chunk+',{"name":"'+name+'","start":'+start
    +'},`'+escapeTemplateString(lines.join('\n'))+'`)';
}
const chunkOffsets=[];
let romsize=ROMHEADERSIZE;

const writeChunk=(romfile,folder,chunk,rawcontent)=>{
    if (romfile) {
        chunkOffsets.push(romsize);
        const content=Buffer.from(rawcontent,'utf8');
        romsize+=content.length;
        fs.appendFileSync(romfile,content);
    } else {
        const fn=folder+'/'+ chunk.toString().padStart(3,'0')+'.js';
        writeFileSync(fn,rawcontent,'utf8');        
    }
    
}
const saveHeader=(romfile,folder,header,payload)=>{    
    writeChunk(romfile,folder,0,'jsonp(0,'+JSON.stringify(header)+',`'
    +escapeTemplateString(payload)+'`)','utf8');
}
const saveJsonp=(romfile,folder,chunk,name,start,L)=>{
    let writeCount=0;
    
    const newcontent=prepareJSONP({chunk,name,start},L);
    if (romfile) {
        writeChunk(romfile,folder,chunk,newcontent);
        writeCount++;
    } else {
        const fn=folder+'/'+ chunk.toString().padStart(3,'0')+'.js';

        if (!fs.existsSync(fn) || fs.readFileSync(fn,'utf8')!==newcontent) {
            writeChunk(romfile,folder,chunk,newcontent);
            writeCount++;
            process.stdout.write('\rwritten'+fn+'     ');
        }
    }
    return writeCount;
}

function save(opts,newheader={}){
    opts=Object.assign(this.opts,opts);
    const folder=(opts.folder||opts.name);
    !fs.existsSync(folder)&& fs.mkdirSync(folder);

    const header=Object.assign({},newheader,this.header);
    const {chunkStarts}=header;

    if (opts.romfile) fs.appendFileSync( opts.romfile,Buffer.from(EMPTYROMHEADER));

    this.payload=opts.payload||'';
    if (typeof this.payload!=='string') this.payload=this.payload.join('\n');
    saveHeader(opts.romfile,folder,header,this.payload);

    let i=1,wc=1;
    const name=opts.name;
    while (i<chunkStarts.length) {
        const L=this._lines.slice( chunkStarts[i-1],chunkStarts[i]);
       
        wc+=saveJsonp(opts.romfile,folder,i,name,chunkStarts[i-1],L)
        i++;
    }
    const start=chunkStarts[chunkStarts.length-1];
    const last=this._lines.slice(start,this._lines.length);
    wc+=saveJsonp(opts.romfile,folder,chunkStarts.length, name, start,last )

    const rep={};
    rep.Number_of_chunk=chunkStarts.length+1;
    rep.written_files=wc;
    if (opts.romfile) {
        chunkOffsets.push(romsize);
        fs.appendFileSync(opts.romfile, Buffer.from( JSON.stringify({offsets:chunkOffsets}) ) )
        fs.writeSync(opts.romfile,(romsize).toString(16).padStart(9,' '), 7 );
        fs.close(opts.romfile);
    }
    return rep;
}
export default save;