import {bsearch} from'../utils/index.js';
import {ATTRPREFIX} from '../platform/constants.js'
class Label {
    constructor(name,opts) {
        this.cb=opts.cb;
        this.log=opts.log||console.log;
        this.name=name;
        this.scope='';
        this.filename='';
        this.lastLine=opts.lastLine||-1;
        this.count=0;
        this.attrdef={};
        this.attrIndex=null;
        for (let opt in opts) {
            if (opt[0]===ATTRPREFIX) { //attribute typedef
                this.attrdef[opt.slice(1)]=opts[opt];
            }
        }
        return this;
    }
    findAttrVal(attr,vals){ // vals separate by ',' , or pass in an array
        if (!this.attrIndex) return [];
        const A=this.attrIndex[attr];
        if (!A) return [];
        const matches={};
        if (typeof vals=='string') vals=vals.split(',');
        for (let i=0;i<vals.length;i++) {
            const V=A[vals[i]];
            for (let j=0;j<V.length;j++) {
                if (!matches[V[j]]) matches[V[j]]=true;
            }
        }
        return Object.keys(matches).map(it=>parseInt(it));
    }
    action(){
        this.count++;
    }
    find(){
        
    }
    countRange(from,to){
        if (typeof this.linepos=='undefined') return 0;
        const at=bsearch(this.linepos,from,true);
        let cnt=0;
        for (let i=at;i<this.linepos.length;i++) {
            if (this.linepos[i]>=to) break;
            cnt++;
        }
        return cnt;
    }
    deserialize(){
        return 0;
    }
    serialize(){
        return [];
    }
    fileDone() { //file completed

    }
    locate(nline){
        //give human readible expression        
    }
    parse(str,basket){
        
    }
    finalize() { //finalize in reverse order of typedef

    }
    reseting(){
        
    }
}
export default Label;