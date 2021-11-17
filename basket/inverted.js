import {unpackPosting,tokenize,TOKEN_SEARCHABLE,
    TK_NAME,TK_TYPE,TK_POSTING} from '../fulltext/index.js'

import {unpackStrings,bsearch,unpack_delta,splitUTF32} from '../utils/index.js'

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
function setupInverted(cb){
    let now=new Date();
    const [from]=this.getSectionRange(sectionName);
    const self=this;
    this.prefetchLines(from,from+3).then(function(){
        self.loadtime.prefetchinverted=new Date()-now; now= new Date();
        const header=JSON.parse(self.getLine(from));
        let tokens;
    
        tokens=unpackStrings(self.getLine(from+1));
        self.loadtime.unpacktokens=new Date()-now; now= new Date();
    
        const linetokenpos=unpack_delta(self.getLine(from+2));
        self.loadtime.linetokenpos=new Date()-now; now= new Date();
        self.loadtime.linetokenposlength=linetokenpos.length
    
        self.deleteLine(from+1);
        self.deleteLine(from+2);
        self.loadtime.deleteline=new Date()-now; now= new Date();
    
        self.inverted={header,tokens,linetokenpos,postingStart:from+3,cache:{}}
        cb&&cb(true);
    });

}


export default {prepareToken,setupInverted}