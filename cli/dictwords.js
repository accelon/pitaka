import { bsearch } from "../utils/bsearch.js";
import { alphabetically,fromObj } from "../utils/sortedarray.js";
import {parseOfftextLine} from '../offtext/parser.js'
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
const dictwords= async (config)=>{
    const fn=process.argv[3];
    const lines=fs.readFileSync(fn,'utf8').split(/\r?\n/);
    // const lines=['這樣一減一多，鬧得去年春季許多地方幾乎人人談糧食，戶戶談統銷。'];
    const wordhead=fs.readFileSync(process.argv[4],'utf8').split(/\r?\n/);
    const W={};
    wordhead.sort(alphabetically);

    for (let i=0;i<lines.length;i++) {
        const [text]=parseOfftextLine(lines[i]);
        text.replace(/([\u3400-\u9fff\ud800-\udfff]+)/g,(m,sentence)=>{
            const words=matchWords(sentence, wordhead);
            // if (words.length) console.log(words);
            words.forEach(w=>{
                if (!W[w]) W[w]=0;
                W[w]++;
            })
        })
    }
    const out=fromObj(W,(k,v)=>{
        return [v,k];
    })
    out.sort((a,b)=>b[0]-a[0]);
    fs.writeFileSync(fn+'-w',out.join('\n'),'utf8')
    // console.log(out)
};
export default dictwords;