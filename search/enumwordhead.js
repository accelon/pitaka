import {parseOfftextLine} from '../offtext/parser.js';
import {bsearch,fromObj} from '../utils/index.js';
const matchWords=(sentence,wordhead)=>{
    let i=0;
    const out=[];
    // console.log(sentence)
    while (i<sentence.length-1) {
        const s=sentence.substr(i);
        let at=bsearch(wordhead,s,true);
        let w=wordhead[at];
        if (w&& s.substr(0,w.length)==w) {
            out.push(w);
            i+=w.length;
        } else {
            i++;
        }
    }
    return out;
}
class EnumWordHead {
    constructor (opts) {
        this.lexicon=opts.lexicon;
        this.wordhead={}
    }
    add(lines,fn){
        const W=this.wordhead;
        console.log('processing',fn,'lines',lines.length)
        for (let i=0;i<lines.length;i++) {
            const [text]=parseOfftextLine(lines[i]);
            text.replace(/([\u3400-\u9fff\ud800-\udfff]+)/g,(m,sentence)=>{
                const words=matchWords(sentence, this.lexicon);
                // if (words.length) console.log(words);
                words.forEach(w=>{
                    if (w.length>1) {
                        if (!W[w]) {
                            W[w]=0;
                        }
                        W[w]++;
                    }
                })
            })
        }
    }
    dump() {
        console.log('dumping')
        const out=fromObj(this.wordhead,(k,v)=>{
         return [v,k];
        })
        const result=out.sort((a,b)=>b[0]-a[0]);
        return {filename:'wordhead-freq.txt',result};
    }
}

export default EnumWordHead;