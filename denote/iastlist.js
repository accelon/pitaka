import TList from './list.js';

export const IASTTokenizer=(str,opts)=>{
    const pattern=opts.pattern||/([a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+)/ig
    const o=str.split(pattern).filter(it=>!!it);
    if (opts.tokenOnly) return o;
    else return o.map(raw=>{return [raw,null]});
}
export class TIASTList extends TList {
    constructor (str,opts={}){
        opts.tokenizer=IASTTokenizer;
        return super(str,opts);
    }
}

export default TIASTList;