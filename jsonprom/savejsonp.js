const escapeTemplateString=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'fs'

const prepareJSONP=({chunk,name,start},lines)=>{
    return 'jsonp('+chunk+',{"name":"'+name+'","start":'+start
    +'},`'+escapeTemplateString(lines.join('\n'))+'`)';
}
const saveHeader=(folder,header,payload)=>{    
    writeFileSync(folder+'/000.js','jsonp(0,'+JSON.stringify(header)+',`'
    +escapeTemplateString(payload)+'`)','utf8');
}
const saveJsonp=(folder,chunk,name,start,L)=>{
    let writeCount=0;
    const fn=folder+'/'+ chunk.toString().padStart(3,'0')+'.js'
    const newcontent=prepareJSONP({chunk,name,start},L);
    if (!existsSync(fn) || readFileSync(fn,'utf8')!==newcontent) {
        writeFileSync(fn,newcontent,'utf8');
        writeCount++;
        process.stdout.write('\rwritten'+fn+'     ');
    }
    return writeCount;
}
function save(opts,newheader={}){
    opts=Object.assign(this.opts,opts);
    const folder=(opts.folder||opts.name);
    !existsSync(folder)&& mkdirSync(folder);

    const header=Object.assign({},newheader,this.header);
    const {chunkStarts}=header;

    let i=1,wc=1;
    const name=opts.name;
    while (i<chunkStarts.length) {
        const L=this._lines.slice( chunkStarts[i-1],chunkStarts[i]);
        wc+=saveJsonp(folder,i,name,chunkStarts[i-1],L)
        i++;
    }
    const start=chunkStarts[chunkStarts.length-1];
    const last=this._lines.slice(start,this._lines.length);
    wc+=saveJsonp(folder,chunkStarts.length, name, start,last )

    this.payload=opts.payload||'';
    if (typeof this.payload!=='string') this.payload=this.payload.join('\n');
    saveHeader(folder,header,this.payload);
    const rep={};
    rep.Number_of_chunk=chunkStarts.length+1;
    rep.written_files=wc;
    return rep;
}
export default save;