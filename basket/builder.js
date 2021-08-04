import {scanLine,fileLines} from 'pitaka/htll';
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';
import kluer from '../cli/kluer.js';
import { getCaption } from '../htll/caption.js';
const {red,yellow}=kluer;
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
    handleTags(tags,text,nline,context){
        let accTagLen=0,s='',prev=0;  
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            if (tag.ele=='htll' &&tag.attrs) {
                context.htll=tag.attrs;
            }
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
            //drop <!DOCTYPE> and so on
            if (!deltag&& tags[i].ele[0]!=='!') s+='<'+tag.raw+'>';
        }
        s+=text.substring(prev);
        return s;
    }
    handleHTLL(tags,text){
        let htll;
        for (let i=0;i<tags.length;i++) {
            if (tags[i].ele=='htll') {htll=tags[i];break;}
        }
        if (!htll)return;
        this.context.title=getCaption(text);
        this.context.htll=htll.attrs;
    }
    addFile(fn,format){
        const rawlines=fileLines(fn,format);
        const out=[];
        this.context.filename=fn;
        this.context.filenline=this.rom.header.lineCount;
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
        try{
            scanLine(rawlines,(li,idx)=>{
                const text=rawlines[idx];
                const nline=this.rom.header.lineCount+idx;
    
                this.context.fileline=idx+1;      
                if (handletext) for (let i=0;i<this.labelTypes.length;i++) {
                    const lt=this.labelTypes[i];
                    if (lt.textual) lt.action({nline,text,context:this.context});
                }
                if (idx==0) this.handleHTLL(li.tags,text);
                if (handletag) out.push(this.handleTags(li.tags,text,nline,this.context));
                else out.push(text);
            });
        } catch(e){
            const {filename,fileline,title}=this.context;
            console.error(yellow(filename+'('+fileline+'):') , title,red(e) );
            throw '';
        }

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