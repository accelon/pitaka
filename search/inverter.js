import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {tokenize,TOKEN_SEARCHABLE,TOKEN_CJK_BMP,TK_NAME,TK_TYPE} from '../search/index.js'
import {alphabetically0,packStrings,pack,pack_delta} from '../utils/index.js'
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
    addPosting(tk,ntoken,tbl=this.tokens) {
        if (tk.charCodeAt(0)<0x2000)tk=tk.toLowerCase();
        if (!tbl[tk]) tbl[tk]=[];
        tbl[tk].push(ntoken);
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
        if ('gc' in global) { //need --expose-gc flag in pitaka.cmd
            global.gc();
        }
        this.linetokenpos.push(this.tokenCount); //last Token
        const inverted=[],section=[];
        const addPostings=(tk,postings)=>{        
            inverted.push([tk,postings]);
        }        
        for (let tk in this.tokens) this.tokens[tk] && addPostings(tk,this.tokens[tk]);
        for (let tk in this.bigram) this.bigram[tk] && addPostings(tk,this.bigram[tk]);
        
        inverted.sort(alphabetically0);

        // console.log(inverted.slice(0,20).map(tk=>tk[0]+tk[1].length))
        const terms=inverted.map(it=>it[0]);
        const postings=inverted.map(it=>it[1]);
        const bigram=!!this.config.bigram;

        const header={'inverted_version':1, termcount:terms.length,bigram};

        section.push(JSON.stringify(header));

        section.push(packStrings(terms));
        section.push(this.linetokenpos);

        for (let i=0;i<postings.length;i++) {
            // const packed=pack_delta(postings[i]); 
            // keeping packed string in section use alow of memory
            section.push(postings[i]);
        }
        return section;
    }
}
export default Inverter;