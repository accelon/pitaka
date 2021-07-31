import {pack,unpack,pack_delta,unpack_delta}from'../utils/index.js';
import HTLLField from './htllfield.js';

export default class HREFs extends HTLLField {
    constructor(opts={}){
        super(opts);
        this.nlines=[];
        this.offsets=[];
        this.lengths=[];
        this.targets=[];
        return this;
    }
    push(href){
        super.push();
        const [nline,offset,length,target]=href;
        this.nlines.push(nline);
        this.offsets.push(offset);
        this.lengths.push(length);
        this.targets.push(target);
    }
    serialize(){
        return [ pack_delta(this.nlines),pack(this.offsets),
            pack(this.lengths),this.targets.join('\t') ];
    }
    deserialize=payload=>{
        this.nlines=unpack_delta(payload.shift());
        this.offsets=unpack(payload.shift());
        this.lengths=unpack(payload.shift());
        this.targets=payload.shift().split(/\t/);
    }    
}


