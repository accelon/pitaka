import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {tokenize,TOKEN_SEARCHABLE,scoreRange,TOKEN_CJK_BMP,TK_NAME,TK_TYPE} from '../fulltext/index.js'
import {arrDelta,alphabetically0,CJKRange,packStrings,pack_delta} from '../utils/index.js'
class Inverter {
    constructor(opts) {
        this.context=opts.context;
        this.config=opts.config;  
        this.bigram={};
        this.tokens={};
        this.romanized={};
        this.linetokenpos=[0];  //last item is the last token count
        this.tokenCount=0;
        const self=this;
        if (this.config.bigram) fileContent(this.config.bigram).then(content=>{
            content.split(/\r?\n/).forEach(item=>{
                const [key,freq]=item.split(/[\t,]/);
                self.bigram[key]=[];
            })
        });
    }
    addPosting(ch,ntoken,tbl=this.tokens) {
        if (!tbl[ch]) tbl[ch]=[];
        tbl[ch].push(ntoken);
    }
    indexLine(line,tokencount){
        const [text]=parseOfftextLine(line);
        let tokenpos=tokencount,prev='';
        const tokens=tokenize(text);
        for (let i=0;i<tokens.length;i++) {
            let tk=tokens[i];
            if (tk[TK_TYPE]>=TOKEN_SEARCHABLE) {
                if (this.config.bigram && prev&&this.bigram[prev+tk[TK_NAME]]) {
                    this.addPosting(prev+tk[TK_NAME],tokenpos-1,this.bigram);
                }
                prev=(TK_TYPE===TOKEN_CJK_BMP)?  prev=tk[TK_NAME]:'';
                this.addPosting(tk[TK_NAME],tokenpos);
            }
            tokenpos++;
        }
        return tokenpos;
    }
    append(lines) {
        if (typeof lines==='string') lines=lines.split(/\r?\n/)
        let ndoc=this.context.startY;
        for (let i=0;i<lines.length;i++) {
            this.tokenCount=this.indexLine(lines[i],this.tokenCount); //10 to split paragraph
            this.linetokenpos[ndoc+1]=this.tokenCount;
            this.tokenCount+=5;//gap between lines
            ndoc++;
        }
    }
    serialize(){
        this.linetokenpos.push(this.tokenCount); //last Token
        const inverted=[],section=[];
        const addPostings=(tk,postings)=>{        
            inverted.push([tk,postings]);
        }        
        for (let tk in this.tokens) this.tokens[tk] && addPostings(tk,this.tokens[tk]);
        for (let tk in this.bigram) this.bigram[tk] && addPostings(tk,this.bigram[tk]);
        
        inverted.sort(alphabetically0);
        const terms=inverted.map(it=>it[0]);
        const postings=inverted.map(it=>it[1]);
        const bigram=!!this.config.bigram;

        const header={'inverted_version':1, termcount:terms.length,bigram};
        section.push(JSON.stringify(header));
        if (bigram) {
            section.push(packStrings(terms));
        } else {
            section.push(terms.join(''));
        }
        section.push(pack_delta(this.linetokenpos));
        for (let i=0;i<postings.length;i++) {
            section.push(pack_delta(postings[i]));
        }
        this.postings=null;
        this.bigram=null;
        this.tokens=null;
        this.linetokenpos=null;
        this.romanized=null;
        
        if ('gc' in global) { //need --expose-gc flag in pitaka.cmd
            console.log('reclaim memory used by inverted');
            global.gc();
        }
        return section;
    }
}
export default Inverter;