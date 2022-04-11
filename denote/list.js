export class TList {
    constructor(str,opts={}) {
        this.data=[];
        this.akey=opts.akey||'attr';
        const akey=this.akey;
        if (typeof str==='string') {
            opts.tokenizer(str,opts).map( ([tk,attr])=>{
                if (tk) this.data.push({m:0,tk,[akey]:attr});
            });    
        } else {
            this.data=str.map( ([tk,attr])=>{return {m:0,tk,[akey]:attr}});
        }
    }
    items(){
        return this.data;
    }
    add(tk,attr){
        this.data.push({tk,attr});
    }
    length(){
        return this.data.length;
    }
    token(i) {
        const o=this.data[i];
        if (o) return o.tk;
    }
    attr(i,akey) {
        const o=this.data[i];
        if (o) return o[akey||this.akey];
    }

}
export default TList;
