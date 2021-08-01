import {scanLine,fileLines} from 'pitaka/htll';
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';
class Builder {
    constructor(opts) {
        this.labelTypes=[];
        this.context={namespaces:{}};
        this.rom=new JSONPROMWriter(opts);
        return this;
    }
    defineLabel(name,Type,opts){
        this.labelTypes.push(new Type(name,opts));
    }
    handleTags(tags,text,nline){
        let accTagLen=0,s='',prev=0;  
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            // if (tag.attrs) console.log(tag.attrs,tag.ele)
            let deltag=false;
            accTagLen+=tag.len;
            s+=text.substring(prev,tag.rawoffset); //offset of input file
            tags[i].offset=s.length; //offset in pitaka (some tags are deleted)
            tags[i].textOffset=s.length-accTagLen; //exclude tag len
            prev=tag.rawoffset+tag.len;
            for (let i=0;i<this.labelTypes.length;i++) {
                const lt=this.labelTypes[i];
                if (lt.textual) continue;
               
               
                if (tag.ele.match(lt.pat)) {
                    lt.action({tag,nline,context:this.context,text});
                    deltag=lt.del;
                    break;
                }
            }
            if (!deltag) s+='<'+tag.raw+'>';
        }
        s+=text.substring(prev);
        return s;
    }
    addFile(fn,format){
        const rawlines=fileLines(fn,format);
        const out=[];
        this.context.filename=fn;
            
        this.context.namespace=fn.replace(/^\.\//,'')
             .replace(/\..+/,'')//extension
             .replace(/[\\\/].+?/,'') //subfolder 
            ||'*' //global context
        this.context.namespaces[this.context.namespace]=0;

        let handletext,handletag;
        for (let i=0;i<this.labelTypes.length;i++) {
            const lt=this.labelTypes[i];
            
            if (lt.textual) handletext=true;
            else handletag=true;
        }
        scanLine(rawlines,(li,idx)=>{
            const text=rawlines[idx];
            const nline=this.rom.header.lineCount+idx;
            if (idx==0) {
                if (!li.tags[0] || li.tags[0].ele!=='htll') {
                    throw 'Missing <htll> as root ele '+text;
                }
                this.context.htll=li.tags[0].attrs;
            }
            if (handletext) for (let i=0;i<this.labelTypes.length;i++) {
                const lt=this.labelTypes[i];
                if (lt.textual) lt.action({nline,text,context:this.context});
            }
           
            if (handletag) out.push(this.handleTags(li.tags,text,nline));
            else out.push(text);
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
        return this.context;
    }
}
export default Builder;