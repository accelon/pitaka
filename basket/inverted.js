import {unpackPosting,TOKENIZE_REGEX,forEachUTF32} from '../fulltext/index.js'
import {unpackStrings,bsearch} from '../utils/index.js'

async function prepareToken(str){
    const tokenposting=[];
    str.replace(TOKENIZE_REGEX,(m,m1)=>{
        forEachUTF32(m1,(ch,i)=>tokenposting.push({token:ch,id:0,posting:null}));
    })
    const jobs=[], Tokens=this.inverted.tokens , postingStart=this.inverted.postingStart;
    tokenposting.forEach(tk=>{
        const at=bsearch(Tokens,tk.token);
        if (at>-1) {
            jobs.push( this.prefetchLines(postingStart+at));
            tk.id=at;
        }
    });
    await Promise.all(jobs);
    for (let i=0;i<tokenposting.length;i++) {
        const tk=tokenposting[i];
        tk.posting = unpackPosting(this.getLine(postingStart+tk.id));
        this.inverted.cache[tk.token]=tk;
    }
    console.log(tokenposting)
}
const sectionName='inverted'
async function loadInverted(){
    const [from,to]=this.getSectionRange(sectionName);
    await this.prefetchLines(from,from+3);
    const header=JSON.parse(this.getLine(from));
    const tokens=unpackStrings(this.getLine(from+1));
    
    return {header,tokens,postingStart:from+3,cache:{}}
}
export default {prepareToken,loadInverted}