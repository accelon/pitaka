import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';
import { getCaption } from '../htll/caption.js';
import {scanLine,fileLines} from '../htll/tagtext.js';

class Builder {
    constructor(opts) {
        this.labelTypes=[];
        this.context={namespaces:{}};
        this.writer=new JSONPROMWriter(opts);
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;
        return this;
    }
    defineLabel(name,Type,opts){
        this.labelTypes.push(new Type(name,opts));
    }
    handleTags(tags,text,nline,context){
        let accTagLen=0,s='',prev=0;  
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            let deltag=false;
            if (tag.ele=='htll' &&tag.attrs) {
                context.htll=tag.attrs;
                deltag=true;
            }
            
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
    async addFile(file,format){
        let fn=file;
        if ('name' in file) {
            fn=file.name;
        }
        if (this.finalized) {
            this.log("cannot addFile, finalized");
            return;
        }
        const rawlines=await fileLines(file,format);
        const out=[];
        this.context.filename=fn;
        this.context.filenline=this.writer.header.lineCount;
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
                const nline=this.writer.header.lineCount+idx;
    
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
            this.log( filename+'('+fileline+'):' , title, e );
            throw '';
        }

        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].fileDone();
        }
        this.writer.append(out);//true to write starting of source  file
    }
    writeLabels(){
        this.writer.addSection('labels');
        const section=serializeLabels(this.labelTypes )
        this.writer.append(section);
    }
    saveJSONP(opts){
        this.save(Object.assign(opts,{jsonp:true}));
    }
    save(opts){
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }
        this.writer.save(opts,this.config)     
    }
    finalize(opts={}){
        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].finalize();
        }
        this.writeLabels();
        //indexes
        this.finalized=true;
        return this.context;
    }
}

export default Builder;