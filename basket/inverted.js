import {unpackPosting,TOKENIZE_REGEX,forEachUTF32,splitUTF32} from '../fulltext/index.js'
import {unpackStrings,bsearch,unpack_delta} from '../utils/index.js'

async function prepareToken(str){
    const tokenposting=[], I=this.inverted;
    const loaded={};
    str.replace(TOKENIZE_REGEX,(m,m1)=>{
        forEachUTF32(m1,(ch,i)=>{
            let tk;
            if (loaded[ch])return;
            tk=I.cache[ch] || {token:ch,id:-1,posting:null};
            loaded[ch]=true;
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


export default {prepareToken,loadInverted}