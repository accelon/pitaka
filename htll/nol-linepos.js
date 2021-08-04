import {NestedOrderedListBuilder,NestedOrderedList} from'../utils/index.js';
import {pack_delta,unpack_delta}from'../utils/index.js';
import {getCaption} from './caption.js'
import { parseKey } from '../utils/nested-ordered-list.js';

import HTLLField from './htllfield.js';
export const regExpFromAName=anamepat=>{
    const names=(anamepat||'').split(';');
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
        this.captions=[]; //optional caption
        if (this.name && this.name!=='.') this.pat=regExpFromAName(this.name)
        return this;
    }
    findCaption(str){
        const captions=str.split('.');
        const N=this.nol;
        let nline=0,eline=N.lastValue(); 
        let prev=0;
        for (let i=0;i<captions.length;i++) {
            const caption=captions[i];
            const at=this.captions.indexOf(caption,prev);
            if (at>-1) {
                const key=N.key(at+1);
                const nextkey=N.nextSibling(key);
                const nline2=N.val(key);
                const eline2=N.val(nextkey)||-1;
                if (nline2>nline && eline2<=eline) {
                    nline=nline2;
                    eline=eline2;
                }
            } else {
                return false
            }
            prev=at+1;
        }
        return nline?[nline,eline]:null;

    }
    nlineOf(str){
        let key=parseKey(str);
        if (!key && this.pat) {
            if (this.pat[1].match(str)) {
                alpha=this.pat[0].replace(/[^\d]/g,'');
                key=parseKey(str.replace(alpha,''));
            }
        }
        const keyseq=this.nol.seqOf(key);
        if (keyseq) {
            const nextkey=this.nol.key(keyseq+1);
            return [this.nol.val(key), this.nol.val(nextkey)||-1 ]; //return -1 , end of namespace
        } else { //try caption, slower
            if (isNaN(parseInt(str)) &&this.opts.caption) {
                return this.findCaption(str);
            }
        }
    }
    push(id,linepos,text) {
        super.push();
        const r=this.nol.add(id,linepos);
        if (!r) {
            throw " cannot add "+id;
        }
        if (this.opts.caption && text) {   
            const caption=getCaption(text);
            this.captions.push(caption);
        }
        return true;
    }
    serialize(){
    //value is nline ,sorted
        if (this.nol.opts.freeOrder) throw "does not support free order NOL"
        const out=[this.nol.packKeys(),  pack_delta(this.nol._getValues()) ]
        if (this.opts.caption) out.push(this.captions.join('\t'));
        return out;
    }
    deserialize(payload){
        const keys=payload.shift()
        const values=unpack_delta(payload.shift());
        this.nol=new NestedOrderedList({keys,values}); //overwrite builder
        if (this.opts.caption) this.captions=payload.shift().split('\t');
    }
}