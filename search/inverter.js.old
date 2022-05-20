import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {tokenize,TOKEN_CJK,TOKEN_ROMANIZE} from '../fulltext/index.js'
import {arrDelta,alphabetically0,CJKRange,packStrings,pack,unpack} from '../utils/index.js'
class Inverter {
    constructor(opts) {
        this.context=opts.context;
        this.config=opts.config;
        this.termFreq={};
  
        this.bigram={};
        this.tokens={};
        this.romanized={};
        const self=this;
        if (this.config.bigram) fileContent(this.config.bigram).then(content=>{
            content.split(/\r?\n/).forEach(item=>{
                const [key,freq]=item.split(/[\t,]/);
                self.bigram[key]=[];
            })
        });
    }
    addPosting(ch,ndoc,ntoken,tbl=this.tokens) {
        if (!tbl[ch]) {
            tbl[ch]=[-ndoc];
        } else {
            if (-ndoc!==tbl[ch][0]) {
                tbl[ch].push(-ndoc);
                tbl[ch][0]=-ndoc;
            }
        }
        tbl[ch].push(ntoken);
    }
    indexCJK(text,ntoken,ndoc){
        let i=0,prev='';
        while (i<text.length) {
            ntoken++;
            const code=text.codePointAt(i);
            const ch=String.fromCodePoint(code);
            if (this.config.bigram && this.bigram[prev+ch]) {
                this.addPosting(prev+ch,ndoc,ntoken-1,this.bigram);
            }
            this.addPosting(ch,ndoc,ntoken);
            prev=ch;
            i++;
            if (code>0xffff) {
                i++;
                prev='';
            }
        }
        return ntoken;
    }
    indexLine(line,ndoc){
        const [text]=parseOfftextLine(line);
        let ntoken=0;
        const tokens=tokenize(text);
        for (let i=0;i<tokens.length;i++) {
            const [offset,w,ty]=tokens[i];
            if (ty==TOKEN_CJK) ntoken=this.indexCJK(w,ntoken,ndoc);
            else{
                ntoken++; //even space char get advance
                if (ty==TOKEN_ROMANIZE) {
                    // this.addPosting(w,ndoc,ntoken,this.romanized);
                }
            }
        }
    }
    append(lines) {
        if (typeof lines==='string') lines=lines.split(/\r?\n/)
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
            postings.push(-postings[0]) ;//last doc
            let prox=[];
            const out=[];
            let prevdoc=0,docfreq=0;
            for (let i=1;i<postings.length;i++) {
                const p=postings[i];
                if (p<1) { //ndoc might be zero
                    let docdelta= (-p) - prevdoc;
                    if (prox.length===1) {
                        out.push(docdelta*2+1,prox[0]);
                    } else {
                        out.push(docdelta*2, prox.length,... arrDelta(prox) );
                    }
                    prevdoc=-p;
                    prox=[];
                } else {
                    docfreq++;
                    prox.push(p);
                }
            }

            /*
            for (let i in postings) {
                const docdelta=parseInt(i)-prevdoc;
                let prox=[];
                for (let j=0;j<postings[i].length/8;j++) {
                    prox.push( parseInt(postings[i].substr(j*8,8),16) );
                }
                if (prox.length===1) {
                    out.push(docdelta*2+1,prox[0]);
                } else {
                    out.push(docdelta*2, prox.length,... arrDelta(prox) );
                }
                
                docfreq++;
                prevdoc=parseInt(i);
            }
            */
            inverted.push([tk,out,docfreq]);
        }        
        for (let tk in this.tokens) this.tokens[tk] && addPostings(tk,this.tokens[tk]);
        for (let tk in this.bigram) this.bigram[tk] && addPostings(tk,this.bigram[tk]);
        
        inverted.sort(alphabetically0);
        const terms=inverted.map(it=>it[0]);
        const postings=inverted.map(it=>it[1]);
        const docfreq=inverted.map(it=>it[2]);
        const bigram=!!this.config.bigram;

        const header={'inverted_version':1, termcount:terms.length, docfreq:true,bigram};
        section.push(JSON.stringify(header));
        if (bigram) {
            section.push(packStrings(terms));
        } else {
            section.push(terms.join(''));
        }
        section.push(pack(docfreq));
        for (let i=0;i<postings.length;i++) {
            section.push(pack(postings[i]));
        }
        this.bigram=null;
        this.tokens=null;
        return section;
    }
}
export default Inverter;