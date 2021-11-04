import {unpackPosting,TOKENIZE_REGEX,forEachUTF32,splitUTF32} from '../fulltext/index.js'
import {unpackStrings,bsearch,unpack_delta} from '../utils/index.js'

async function prepareToken(str){
    const tokenposting=[], I=this.inverted;
    const loaded={};
    str.replace(TOKENIZE_REGEX,(m,m1)=>{
        forEachUTF32(m1,(ch,i)=>{
            if (loaded[ch])return;
            loaded[ch]=true;
            const tk=I.cache[ch] || {token:ch,id:-1,posting:null};
            tokenposting.push(tk);
        });
    })
   
    const jobs=[],  postingStart=this.inverted.postingStart;
    tokenposting.forEach(tk=>{
        if (tk.id>-1) {
            return; //already in cache
        }
        const at=bsearch(I.tokens,tk.token);
        if (at>-1) {
            jobs.push( this.prefetchLines(postingStart+at));
            tk.id=at;
        }
    });
    await Promise.all(jobs);
    for (let i=0;i<tokenposting.length;i++) {
        const tk=tokenposting[i];
        if (!tk.posting) {
            tk.posting = unpackPosting(this.getLine(postingStart+tk.id),tk.token);
            
            this.deleteLine(postingStart+tk.id);
            this.inverted.cache[tk.token]=tk;    
        }
    }
    return tokenposting;
}
const sectionName='inverted'
async function loadInverted(){
    const [from]=this.getSectionRange(sectionName);
    await this.prefetchLines(from,from+3);
    const header=JSON.parse(this.getLine(from));
    let tokens;
    if (header.bigram) {
        tokens=unpackStrings(this.getLine(from+1));
    } else {
        tokens=splitUTF32(this.getLine(from+1)).map(cp=>String.fromCodePoint(cp));
    }
    const linetokenpos=unpack_delta(this.getLine(from+2));
    this.deleteLine(from+1);
    this.deleteLine(from+2);
    return {header,tokens,linetokenpos,postingStart:from+3,cache:{}}
}
function txFromLinepos(linepos){
    if (!linepos) return [];
    const out=[];
    const linetokenpos=this.inverted.linetokenpos;
    for (let i=0;i<linepos.length-1;i++) {
        const y=linepos[i]-1, nexty=linepos[i+1]-1; //linepos is 1-base
        out.push( [ y>0?linetokenpos[ y ]:0 , linetokenpos[nexty]] );
    }
    return out;
}
function txFromLabel(lbl){
    if (typeof lbl==='string') {
        lbl=this.getLabel(lbl);
    }
    return this.txFromLinepos(lbl.linepos);
}
function txToLinepos(tokenpos) {
    const linetokenpos=this.inverted.linetokenpos;
    const out=[];
    for (let i=0;i<tokenpos.length;i++) {
        out.push(bsearch(linetokenpos, tokenpos[i],true)+1);
    }
    return out;
}
export default {prepareToken,loadInverted, txFromLinepos,txFromLabel,txToLinepos}