export const tokenizeIAST=(str,opts={})=>{
    const pattern=opts.pattern||/([a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+)/ig
    const o=str.split(pattern).filter(it=>!!it);
    if (opts.tokenOnly) return o;
    else return o.map(raw=>{return [raw,null]});
}
export default {'iast':tokenizeIAST};