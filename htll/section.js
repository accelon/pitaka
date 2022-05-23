import Label from './label.js' //cannot inherit from labelbook as release build will mangle the name
import {pack,unpack,pack_delta,unpack_delta,bsearch,parseArg} from'../utils/index.js';
class LabelSection extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.superpat=this.pat;
        this.pat=/^\/?(pre|b)(.*)/i
        this.sectionNames=[];
        this.sectionCount=[];
        this.sectionLinePos=[];
        this._prevSection=-1 || (opts.sectionStartFrom - 1);
        this._sectionCount=0;
        this._startoffset=0;
        return this;
    }
    action({tag ,nline,text}){
        super.action({tag,nline,text,pat:this.superpat})
        
        const m=tag.raw.match(this.pat);
        const closing=tag.raw[0]=='/';
        const id=m[2].trim();
        const ele=m[1].toLowerCase();
        if (ele=='pre' && this.bookNames.length>1) { //starting of second book
            this.sectionCount.push(this.sectionCount);
            this._sectionCount=0;
        } else if (ele=='b') {
            if (closing) {
                const name=text.substring(this._startoffset,tag.rawoffset);
                this.sectionNames.push(name);
                return;
            }
            this._startoffset=tag.rawoffset+tag.len
            
            const ch=parseInt(id);
            if (!isNaN(ch) &&this._prevSection+1!==ch) {
                throw 'section id should be +1 of previous one, at '+nline
            } else {
                this._prevSection++;
            }
            this._sectionCount++;
            this.sectionLinePos.push(nline);
        }
        this.count++;
    }
    finalize(){
        this.sectionCount.push(this.sectionCount);
        this._sectionCount=0;
    }
    serialize(){
        const out=super.serialize();
        out.push(this.sectionNames.join('\t'));  
        out.push(pack_delta(this.sectionLinePos)); 
        out.push(pack(this.sectionCount));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.sectionNames=payload[at++].split('\t');
        this.sectionLinePos=unpack_delta(payload[at++])
        this.sectionCount=unpack(payload[at++]);
    }
    locate(nline){
        console.log('locating',nline)
    }
    parse(input){
        const args=parseArg(input);
        let nbook=-1,sline,eline,nsection=-1,sections=[];
        if (args.$) {
            const r=this.getBookRangeByName(args.$);
            if (r) nbook=r[2];
            else { 
                nbook=parseInt(parts[0]);
            }
            if (!args._ && !args.S) sections=this.namedSections(nbook);
        }
        if (args._) {
            if (nbook>-1) [sline,eline,nsection]=this.getSectionRange(nbook,args._);
        }
        if (args.S) {
            sline=sline||0;
            let l;
            [l,eline,nsection]=this.getSection(nbook,args.S);
            sline+= l;
            // eline=r[1];
        }
        let nextnamed=-1,prevnamed=-1;
        if (nsection>-1) {
            const snames=this.sectionNames;
            if (nsection<snames.length){
                nextnamed=nsection+1;
                while (nextnamed<snames.length&& !snames[nextnamed]) {
                    nextnamed++;
                }
            }
            if (nsection>0) {
                prevnamed=nsection-1;
                while (prevnamed&& !snames[prevnamed]) {
                    prevnamed--;
                }
            }
        }

        return {input,nbook,nsection,nextnamed, prevnamed,sline,eline,sections  }
    }
    namedSections(nbook) {
        if (nbook<0)return [];
        const out=[];
        const [line,endline]=this.getBookRange(nbook);
        const start=bsearch(this.sectionLinePos,line,true);
        const end=bsearch(this.sectionLinePos,endline,true);
        for (let i=start;i<=end;i++) {
            const name=this.sectionNames[i];
            if (name) out.push([i,name])
        }
        return out;
    }
    getBookRange(nbook) {
        const line=this.bookLinePos[nbook];
        const endline=nbook<this.bookLinePos.length-1?this.bookLinePos[nbook+1]:this.lastLine;
        return [line,endline]
    }
    getBookRangeByName(name){
        let at=this.bookNames.indexOf(name);
        if (at==-1) at=this.bookId.indexOf(name);
        if (at==-1) return null;
        const [line,endline]=this.getBookRange(at);
        return [line,endline, at];
    }
    getBookAtLine(line) {
        if (line<1) return -1;
        return bsearch(this.bookLinePos ,line, true);
    }
    getSection(nbook,section){
        let at,line=-1,end=0 , pos=0,bookline=0,bookendline=this.lastLine;
        if (nbook) {
            [bookline,bookendline]=this.getBookRange(nbook);
        }
        if (typeof section=='string' && isNaN(parseInt(section))) {
            while (pos<this.sectionNames.length) {
                at=this.sectionNames.indexOf(section,pos);
                line=-1;end=0;
                if (at==-1) break;
                line=this.sectionLinePos[at];
                end=at<this.sectionLinePos.length-1?this.sectionLinePos[at+1]:this.lastLine;
                pos=at+1;
                if (line>bookline && bookendline > end) break;                
            }
        } else {
            at=parseInt(section);
            line=this.sectionLinePos[at];
            end=at<this.sectionLinePos.length-1?this.sectionLinePos[at+1]:this.lastLine;   
        }
        return [line,end,parseInt(at)]
    }
    getSectionRange(nbook,from,to){
        let [line ,end,n ]=this.getSection(nbook,from);
        let to_line,to_end;
        if (to) [to_line,to_end]=this.getSection(nbook,from);

        return [line,to_end||end,n];
    }
    find(tofind,near=false){
    }
}
export default LabelSection;