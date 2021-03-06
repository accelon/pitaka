import {fileContent} from '../format/index.js'
import {parseOfftextLine} from '../offtext/parser.js';
import {tokenize,TOKEN_SEARCHABLE,TK_OFFSET,TOKEN_CJK_BMP,TOKEN_ROMANIZE,TK_NAME,TK_TYPE,LINETOKENGAP} from '../search/index.js'
import {alphabetically0,packStrings,pack,pack2d,pack_delta,bsearch,fromObj} from '../utils/index.js'
import {orthOf} from 'provident-pali'
import {isStopword} from './stopwords.js';
class Inverter {
    constructor(opts) {
        this.context=opts.context;
        this.config=opts.config;  
        this.bigram={};
        this.tokens={};
        this.romanized={};
        this.linetokenpos=[0];  //last item is the last token count
        this.tokenCount=0;
        this.compound={}; // formula : [lexemes]  詞譜及所含的詞件
        this._orths={}; //orth                    所有的正詞
        this.report={};

        const self=this;
        if (this.config.bigram) fileContent(this.config.bigram).then(content=>{
            content.split(/\r?\n/).forEach(item=>{
                const [key,freq]=item.split(/[\t,]/);
                self.bigram[key]=[];
            })
        });
    }
    addPosting(tk,ntoken,tbl=this.tokens) {
        // if (tk.charCodeAt(0)<0x2000)tk=tk.toLowerCase();
        if (!tbl[tk]) tbl[tk]=[];
        tbl[tk].push(ntoken);
    }
    indexPaliToken(w,tokenpos) { //share a same token pos
        const lexemes=w.split(/\d+/);
        for (let i=0;i<lexemes.length;i++) {
            const lexeme=lexemes[i];
            this.addPosting(lexeme,tokenpos);
        }
        if (lexemes.length>1) {
            const orth=orthOf(w);
            if (!this.compound[w] && orth) {
                this.compound[w]=lexemes;
                this._orths[ orth ]=w;
            }
        }
    }
    indexLine(line,tokencount){
        const [text]=parseOfftextLine(line);
        const debug=~line.indexOf('countenanced')
        let prev='',tkpos=0;
        const tokens=tokenize(text);
        const provident=this.config.lang=='pl';

        for (let i=0;i<tokens.length;i++) {
            const tk=tokens[i];
            let tok=tk[TK_NAME].trim();
            const tktype=tk[TK_TYPE];
            if (tktype>=TOKEN_SEARCHABLE) {
                if (provident) {
                    this.indexPaliToken(tok,tokencount+i);
                } else {                
                    if (tktype===TOKEN_CJK_BMP && this.config.bigram && prev&&this.bigram[prev+tok]) {
                        this.addPosting(prev+tok.toLowerCase(),tokencount+i-1,this.bigram);
                    }
                    tok=tok.toLowerCase();
                    if (tktype==TOKEN_ROMANIZE && (tok.length<2 || !isNaN(parseInt(tok)) || isStopword(tok))) continue;
                    this.addPosting(tok,tokencount+i);
                }
                prev=(TK_TYPE===TOKEN_CJK_BMP)?prev=tok:'';
            }
        }
        return tokencount+tokens.length;
    }
    append(lines) {
        if (typeof lines==='string') lines=lines.split(/\r?\n/)
        let ndoc=this.context.startY;
        for (let i=0;i<lines.length;i++) {
            const tokencount=this.indexLine(lines[i],this.tokenCount); //10 to split paragraph
            this.tokenCount=tokencount;
            this.linetokenpos[ndoc+1]=this.tokenCount;
            this.tokenCount+=LINETOKENGAP;//gap between lines
            ndoc++;
        }
    }
    serializeCompound(inverted){
        const middle={};
        const lexemes2id=lexemes=>{
            const tokenid=[];
            for (let i=0;i<lexemes.length;i++) {
                const lexeme=lexemes[i];
                const at=bsearch(inverted, lexeme, false, 0);
                if (at==-1) {
                    throw lexeme +'not found in compound '+comp;
                }
                tokenid.push(at);
                if (this._orths[lexeme] && !middle[lexeme]) {
                    middle[lexeme]=lexemes2id(this.compound[this._orths[lexeme]]);
                }
            }
            return tokenid;
        }

        const compound_lexeme={};
        for (let comp in this.compound) {
            compound_lexeme[comp]=lexemes2id(this.compound[comp])
        }

        const arrmiddle=fromObj(middle,(a,b)=>[a,b]); //同時是compound 的部件
        arrmiddle.sort(alphabetically0);
        const compounds=arrmiddle.map(a=>a[0]);
        const formula=arrmiddle.map(a=>a[1]).concat(fromObj(compound_lexeme,(a,b)=>b));

        //compounds lexeme and all formula, first compounds.length formula has orth form
        return {compounds ,formula} ;
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

        inverted.sort((a,b)=>b[1].length-a[1].length);
        const freq=inverted.slice(0,10);
        console.log('top 10 tokens',freq.map(a=>[a[0],a[1].length]));
        inverted.sort(alphabetically0);
        this.report={uniqueToken:inverted.length,tokenCount:this.tokenCount};
        // console.log(inverted.slice(0,20).map(tk=>tk[0]+tk[1].length))
        const lemmas=inverted.map(it=>it[0]);
        const postings=inverted.map(it=>it[1]);
        const bigram=!!this.config.bigram;

        const header={'inverted_version':3, lemmas:lemmas.length,bigram,tokenCount:this.tokenCount};

        const {compounds,formula}=this.serializeCompound( inverted );
//        console.log(compounds, formula.length)
        section.push(JSON.stringify(header));

        section.push(packStrings(compounds));
        section.push(pack2d(formula));

        section.push(packStrings(lemmas));
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