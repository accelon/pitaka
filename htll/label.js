import {bsearch} from'../utils/index.js';
class Label {
    constructor(name,opts={}) {
        this.cb=opts.cb;
        this.log=opts.log||console.log;
        this.name=name;
        this.scope='';
        this.filename='';
        this.lastLine=opts.lastLine||-1;
        this.resets=opts.resets||null; //reseting other label
        return this;
    }
    action(){
        // console.error('not implemented')
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
    finalize() { //build complete

    }
    reset(){
        
    }
}
export default Label;