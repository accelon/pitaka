import {NestedOrderedListBuilder,NestedOrderedList} from'../utils/index.js';
import {pack_delta,unpack_delta}from'../utils/index.js';
import { parseKey } from '../utils/nested-ordered-list.js';

import HTLLField from './htllfield.js';
export const regExpFromAName=anamepat=>{
    const names=(anamepat||'').split(',');
    return names.map(pat=>{
        return [pat,new RegExp('^'+pat.replace(/(\d+)/,(m,m1)=>{
            const depth=parseInt(m1);
            if (depth==0) return m;
            return '\\d+' + "(\\.\\d+)?".repeat(depth-1);
        }))];
    })
}

export class NOLLinePos extends HTLLField {
    constructor (opts={}){
        super(opts);
        this.nol=new NestedOrderedListBuilder();
        this.name=opts.name;
        if (this.name && this.name!=='.') this.pat=regExpFromAName(this.name)
        return this;
    }
    nlineOf(str){
        let key=parseKey(str);
        if (!key && this.pat) {
            if (this.pat[1].match(str)) {
                alpha=this.pat[0].replace(/[^\d]/g,'');
                key=parseKey(str.replace(alpha,''));
            }
        }
        const keyidx=this.nol.indexOf(key);
        if (key>-1) {
            const nextkey=this.nol.key(keyidx+1);
            return [this.nol.val(key), this.nol.val(nextkey)||-1 ]; //return -1 , end of namespace
        }
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
        this.nol=new NestedOrderedList({keys,values}); //overwrite builder
    }
}