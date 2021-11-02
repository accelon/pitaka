import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {isCJKStopWord} from '../fulltext/utils.js'
import {arrDelta,alphabetically0,CJKRange,packStrings,pack,unpack} from '../utils/index.js'
class Inverter {
    constructor(opts) {
        this.context=opts.context;
        this.config=opts.config;
        this.termFreq={};
  
        this.bigram={};
        this.tokens={};

        const self=this;
        if (this.config.bigram) fileContent(this.config.bigram).then(content=>{
            content.split(/\r?\n/).forEach(item=>{
                const [key,freq]=item.split(/[\t,]/);
                self.bigram[key]=[];
            })
        });
    }
    indexCJK(text,tokencount,ndoc){
        let i=0,prev='';
        while (i<text.length) {
            tokencount++;
            const code=text.codePointAt(i);
            const ch=String.fromCodePoint(code);

            if (CJKRange(text[i])) {
                if (this.bigram[prev+ch]) {
                    if (!this.bigram[prev+ch][ndoc]) this.bigram[prev+ch][ndoc]=[];
                    this.bigram[prev+ch][ndoc].push(tokencount-1);
                }

                if (!this.tokens[ch])this.tokens[ch]=[];
                if (!this.tokens[ch][ndoc]) this.tokens[ch][ndoc]=[];
                this.tokens[ch][ndoc].push(tokencount);
            }
            prev=ch;
            i++;
            if (code>0xffff) {
                i++;
                prev='';
            }
        }
        return tokencount
    }
    indexLine(line,ndoc){
        const [text]=parseOfftextLine(line);
        let tokencount=0;
        text.replace(/(([\u0021-\u1fff]+)|([\u2000-\u2fff\u3001-\uffff]+))/ig,(m,m1)=>{
            // console.log(m1.length)
            if (m1.charCodeAt(0)>0x2000) { //chinese
                tokencount=this.indexCJK(m1,tokencount,ndoc);
            } else { //western languages
                tokencount++;
                // console.log('western',m1)
            }
        })
    }
    append(lines) {

        let ndoc=this.context.startY;
        this.context.tokencount=0;
        for (let i=0;i<lines.length;i++) {
            this.indexLine(lines[i],ndoc);
            ndoc++;
        }
    }
    serialize(){
        const inverted=[],section=[];

        const addPostings=(tk,postings)=>{
            const out=[];
            let prevdoc=0,docfreq=0;
            for (let i=0;i<postings.length;i++) {
                if (!postings[i]) continue;
                const ndoc=i-prevdoc-1;
                if (postings[i].length===1) {
                    out.push(ndoc*2+1,postings[i][0]);
                } else {
                    out.push(ndoc*2, postings[i].length,... arrDelta(postings[i]) );
                }
                docfreq++;
                prevdoc=i;
            }
            inverted.push([tk,out,docfreq]);
        }
        
        for (let tk in this.tokens) this.tokens[tk] && addPostings(tk,this.tokens[tk]);
        for (let tk in this.bigram) this.bigram[tk] && addPostings(tk,this.bigram[tk]);
        
        inverted.sort(alphabetically0);
        const terms=inverted.map(it=>it[0]);
        const postings=inverted.map(it=>it[1]);
        const docfreq=inverted.map(it=>it[2]);
        section.push(JSON.stringify({'inverted_version':1, termcount:terms.length}));
        section.push(packStrings(terms));
        section.push(pack(docfreq));
        for (let i=0;i<postings.length;i++) {
            section.push(pack(postings[i]));
        }
        return section;
    }
}
export default Inverter;