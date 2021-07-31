import {scanLine,fileLines} from 'pitaka/htll';
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';
class Builder {
    constructor(opts) {
        this.labelTypes=[];
        this.rom=new JSONPROMWriter(opts);
        return this;
    }
    defineLabel(name,Type,opts){
        this.labelTypes.push(new Type(name,opts));
    }
    addFile(fn,format){
        const rawlines=fileLines(fn,format);
        const out=[];
        for (let i=0;i<this.labelTypes.length;i++) {
            const lt=this.labelTypes[i];
            lt.filename=fn;
            //subfolder in same scope
            lt.scope=fn.replace(/[\/\..]+/,''); 
        }
        scanLine(rawlines,(li,idx)=>{
            let s='',prev=0;  
            const text=rawlines[idx];
            let accTagLen=0;
            const nline=this.rom.header.lineCount+idx;
            for (let i=0;i<li.tags.length;i++) {
                const tag=li.tags[i];
                // if (tag.attrs) console.log(tag.attrs,tag.ele)
                let deltag=false;
                accTagLen+=tag.len;
                s+=text.substring(prev,tag.rawoffset); //offset of input file
                li.tags[i].offset=s.length; //offset in pitaka (some tags are deleted)
                li.tags[i].textOffset=s.length-accTagLen; //exclude tag len
                prev=tag.rawoffset+tag.len;
                for (let i=0;i<this.labelTypes.length;i++) {
                    const lt=this.labelTypes[i];
                    if (tag.ele.match(lt.pat)) {
                        lt.action({tag,nline,builder:this,text});
                        deltag=lt.del;
                        break;
                    }
                }
                if (!deltag) s+='<'+tag.raw+'>';
            }
            s+=text.substring(prev);
            out.push(s);
        });
        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].fileDone();
        }
        this.rom.append(out);
    }
    writeLabels(){
        this.rom.addSection('labels');
        const section=serializeLabels(this.labelTypes )
        this.rom.append(section);
    }
    finalize(opts={}){
        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].finalize();
        }
        this.writeLabels();
        if (!opts.nowrite) this.rom.save();
    }
}
export default Builder;