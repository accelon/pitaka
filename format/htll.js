import { getCaption } from '../htll/caption.js';
import {scanLine} from '../htll/tagtext.js';

const handleHTLL=(tags,text)=>{
    let htll;
    for (let i=0;i<tags.length;i++) {
        if (tags[i].ele=='htll') {htll=tags[i];break;}
    }
    if (!htll)return;
    this.context.title=getCaption(text);
    this.context.htll=htll.attrs;
}


class Formatter_HTLL {
    constructor (context,log){
        this.context=context;
        this.log=log;
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
    scan(rawcontent){
        const rawlines=rawcontent.split(/\r?\n/);
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
            else this.out.push(text);
        })

    }
}


export default Formatter_HTLL;