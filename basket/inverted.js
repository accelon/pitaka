import {unpackPosting,TOKENIZE_REGEX,forEachUTF32,splitUTF32,tokenize,TOKEN_SEARCHABLE,
    TK_NAME,TK_TYPE,TK_POSTING} from '../fulltext/index.js'

import {unpackStrings,bsearch,unpack_delta} from '../utils/index.js'

async function prepareToken(str){
    const loading={}, I=this.inverted;
    const tokens=tokenize(str); //ch, offset, type, id , postings
    for (let i=0;i<tokens.length;i++) {
        const tk=tokens[i];
        if (tk[TK_TYPE]<TOKEN_SEARCHABLE) continue;
        const at=bsearch(I.tokens,tk[TK_NAME]);
        if (at>-1) {
            tokens[i][TK_POSTING] = I.cache[tk[TK_NAME]];
        } else {
            tokens[i][TK_POSTING] = -1; //loading
        }
    }
    const jobs=[],  postingStart=this.inverted.postingStart;
    tokens.forEach(tk=>{
        if ((tk[TK_POSTING]&&tk[TK_POSTING]!==-1) || tk[TK_TYPE]<TOKEN_SEARCHABLE ) {
            if (!tk[TK_POSTING]) tk[TK_POSTING]=[];  //weightToken doesn't accept null value
            return; //already in cache
        }
        const at=bsearch(I.tokens,tk[TK_NAME])
        if (at>-1) {
            tk[TK_POSTING]=at;
            if (!loading[at]) {
                loading[at]=true;
                jobs.push( this.prefetchLines(postingStart+at));
            }
        }
    });

    await Promise.all(jobs);

    for (let i=0;i<tokens.length;i++) {
        const tk=tokens[i];
        if (typeof tk[TK_POSTING]==='number') {
            const y=postingStart+tk[TK_POSTING];
            const linetext=this.getLine(y);
            if (linetext) {
                tk[TK_POSTING] = unpackPosting(linetext,tk[TK_NAME]);
                this.deleteLine(y);
                this.inverted.cache[tk[TK_NAME]]=tk[TK_POSTING]    
            } else {
                tk[TK_POSTING]=this.inverted.cache[tk[TK_NAME]] || [];
            }
        }
    }
    return tokens;
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