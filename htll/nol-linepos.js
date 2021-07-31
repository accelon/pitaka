import {NestedOrderedListBuilder,NestedOrderedList} from'../utils/index.js';
import {pack_delta,unpack_delta}from'../utils/index.js';
import HTLLField from './htllfield.js';
export default class NOLLinePos extends HTLLField {
    constructor (opts={}){
        super(opts);
        this.nol= new NestedOrderedListBuilder();
        return this;
    }
    push(id,linepos) {
        super.push();
        const r=this.nol.add(id,linepos);
        if (!r) {
            throw " cannot add "+id+' at '+linepos;
        }
        return true;
    }
    serialize(){
    //value is nline ,sorted
        if (this.nol.opts.freeOrder) throw "does not support free order NOL"
        return [this.nol.packKeys(),  pack_delta(this.nol._getValues()) ]
    }
    deserialize(payload){
        const keys=payload.shift()
        const values=unpack_delta(payload.shift());
        return new NestedOrderedList({keys,values});
    }
}