import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {tokenize,TOKEN_CJK,TOKEN_ROMANIZE} from '../fulltext/index.js'
import {arrDelta,alphabetically0,CJKRange,packStrings,pack_delta} from '../utils/index.js'
class Inverter {
    constructor(opts) {
        this.context=opts.context;
        this.config=opts.config;  
        this.bigram={};
        this.tokens={};
        this.romanized={};
        this.linetokenpos=[];
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
    indexCJK(text,ntoken,ndoc){
        let i=0,prev='';
        while (i<text.length) {
            ntoken++;
            const code=text.codePointAt(i);
            const ch=String.fromCodePoint(code);
            if (this.config.bigram && this.bigram[prev+ch]) {
                this.addPosting(prev+ch,ntoken-1,this.bigram);
            }
            this.addPosting(ch,ntoken);
            prev=ch;
            i++;
            if (code>0xffff) {
                i++;
                prev='';
            }
        }
        return ntoken;
    }
    indexLine(line,tokencount){
        const [text]=parseOfftextLine(line);
        let tokenpos=tokencount;
        const tokens=tokenize(text);
        for (let i=0;i<tokens.length;i++) {
            const [offset,w,ty]=tokens[i];
            if (ty==TOKEN_CJK) tokenpos=this.indexCJK(w,tokenpos,tokencount);
            else{
                tokenpos++; //even space char get advance
                if (ty==TOKEN_ROMANIZE) {
                    // this.addPosting(w,ntoken,this.romanized);
                }
            }
        }
        return tokenpos;
    }
    append(lines) {
        if (typeof lines==='string') lines=lines.split(/\r?\n/)
        let ndoc=this.context.startY;
        for (let i=0;i<lines.length;i++) {
            this.tokenCount=this.indexLine(lines[i],this.tokenCount); //10 to split paragraph
            this.linetokenpos[ndoc]=this.tokenCount;
            this.tokenCount+=5;//gap between lines
            ndoc++;
        }
    }
    serialize(){
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