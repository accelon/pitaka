export const tokenizeIAST=(str,opts={})=>{
    const pattern=opts.pattern||/([a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*)/ig
    const o=str.split(pattern).filter(it=>!!it);
    if (opts.tokenOnly) return o;
    else return o.map(raw=>{return [raw,null]});
}
tokenizeIAST.splitPunc=str=>str;

export const tokenizeIASTPunc=(str,opts={})=>{
    opts.pattern=/([“‘]*[a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*[’।॥\.,;?\!…”–]* *)/ig
    return tokenizeIAST(str,opts);
}
tokenizeIASTPunc.splitPunc=token=>{
    const mlead=token.match(/^([“‘]*)/);
    let lead,tail;
    if (mlead) {
    	lead=mlead[1];
		token=token.slice(lead.length);
	}
	const mtail=token.match(/(\d*[’।॥\.,;?\!…”–]* *)$/);
	if (mtail) {
		tail=mtail[1];
		token=token.slice(0,token.length-tail.length);
	}
    return [ lead, token,tail];
}
export default {'iast':tokenizeIASTPunc};