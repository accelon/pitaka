import {bsearch} from'../utils/index.js';
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
        for (let opt in opts) {
            if (opt[0]=='@') { //attribute typedef
                this.attrdef[opt.slice(1)]=opts[opt];
            }
        }
        return this;
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