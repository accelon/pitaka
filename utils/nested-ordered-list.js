import { bsearch } from "./bsearch.js";

export const parseKey=key=>{
        if (!key)return false;
        key=key.replace(/^\.+/,'').replace(/\.+$/,'');
        const rawnums= key.split('.')
        const nums=rawnums.map(i=>parseInt(i)).filter(i=>!isNaN(i));
        if (rawnums.length!==nums.length) return false; //contain non digit
        while (nums.length && nums[nums.length-1]==0) nums.pop();
        if (!nums.length)return false;
        return nums;
}
export const compareKey=(key1,key2)=> {
        const len=Math.max(key1.length,key2.length);
        for (let i=0;i<len;i++) {
            const d= (key1[i]||0) - (key2[i]||0) 
            if (d) return d;
        }
        return 0;
}
const listKeys=(keys,parent=[])=>{
    let out=[];
    for (let i=0;i<keys.length;i++) {
        if (Array.isArray(keys[i])) {
            out=out.concat(listKeys(keys[i], parent.concat(i) ));
        } else {
            if ( !isNaN(keys[i]) ) {
                out.push( parent.concat(i) );
            } else if (typeof keys[i]=='undefined') {
                if (parent && i) {
                    out.push( parent.concat(i))
                }
            }
        }
    }
    if (parent.length==0) {//format to string
        out=out.map( r=>{ while (r.length&&!r[r.length-1])r.pop(); return r.join('.') })
    }
    return out;
}

const unpackKeys=(keys,vidx=0)=>{
    let out=[];
    for (let i=0;i<keys.length;i++) {
        if (Array.isArray(keys[i])) {
            const r=unpackKeys(keys[i],vidx);
            vidx=r[1];
            out.push(r[0]);
        } else {
            if (keys[i]) {
                if (keys[i]<0) {
                    const n=-keys[i];
                    const subarr=new Array(n);
                    subarr[0]=vidx+1;
                    out.push( subarr)
                    vidx+= n;
                } else {
                    vidx=keys[i];
                    out.push(vidx);
                }
            } else {
                out.push(vidx)
            }
        }
    }
    return [out,vidx];
}
export class NestedOrderedList {
    constructor (opts) {
        this.opts=Object.assign({sep:'\t'},opts);
        let _values=opts.values;
        if (typeof opts.values=='string') {
            _values=opts.values.split(this.opts.sep);
        }
        // console.log(JSON.stringify(opts.keys))
        const rawkeys=JSON.parse(opts.keys);
        let _keys;
        if (typeof rawkeys=='number') { //1 level only
            _keys=new Array(-rawkeys) ;
        } else {
            // vidx=0;
            _keys=unpackKeys(rawkeys,0)[0];
        }

        //when serialized , first null changed to 0 for faster loading (same type)
        if (_keys[0]===0) delete _keys[0]; 
        this._getKeys=()=>_keys;
        this._valueOf=i=>_values[i-1];
        this._getValues=()=>_values;
        this.lastValue=()=>_values[_values.length-1];
        this.itemCount=()=>_values.length;
    }
    getEnd(keys){
        let lastitem= keys[keys.length-1];
        const t=typeof lastitem;
        if (t=='undefined') { //a compressed final array 
            return keys[0]+keys.length;
        } else if (t=='number') {
            return keys[keys.length-1];
        } else { 
            return this.getEnd(lastitem);
        }
    }
    key(idx,path=[],subkeys){
        if (typeof idx!=='number') return;
        if (!subkeys) subkeys=this._getKeys();
        if (!subkeys||idx<1) return;
        if (idx>this.itemCount())return;
        for (let i=0;i<subkeys.length;i++) {
            if (Array.isArray(subkeys[i])) {
                const start=subkeys[i][0]
                const end=typeof start=='number'?this.getEnd(subkeys[i]):0;
                if (start===idx) return path.concat(i); //match
                if (Array.isArray(start) || (idx>=start && idx<end) ) {
                    path=this.key(idx, path.concat(i), subkeys[i]);
                }
            } else {
                if (subkeys[0]+subkeys[i]===idx+1) return path.concat(idx-subkeys[0]);
                else if (typeof subkeys[i]=='undefined') {
                    if (i) {
                        return path.concat(idx-(subkeys[0]||0) );
                    } else if (typeof subkeys[idx]=='number') {
                        return path.concat(subkeys[idx]);
                    }
                }
            }
        }
        while (path.length && path[path.length-1]==0) path.pop();
        return path;
    }
    val(key) {
        return this._valueOf( this.seqOf(key) )
    }
    seqOfVal(v,closest=false) {
        const values=this._getValues();
        return bsearch(values,v,closest)+1;
    }
    find(key){
        if (typeof key=='string') key=parseKey(key);
        if (typeof key=='number') key=[key];
        let keys=this._getKeys();
        if (!keys)return [0,null];
        let idx=0; //not found
        for (let i=0;i<key.length;i++) {
            const childkeys=keys[ key[i] ];
            const t=typeof childkeys;
            if (t=='number') {
                return [childkeys, null ];
            } else if (t=='undefined' && i==key.length-1) {
                return [ (key[i]<keys.length)?(keys[0]||0)+key[i]:0, childkeys];
            }
            keys=childkeys;
            if (!keys) break;
        }
        const children=keys;

        while ((typeof keys!=='undefined')&&Array.isArray(keys)) {
            idx=keys[0] ;
            keys=keys[0];
        }

        if (typeof idx=='undefined') idx=0;
        return [idx, children ] ;
    }
    seqOf(key) { //one-based
        return this.find(key)[0];
    }
    hasChild(key) {
        return !!this.find(key)[1];
    }
    nextSibling(key) {
        if (typeof key=='string') key=parseKey(key);
        if (this.hasChild(key)) {
            const count=this.siblingCount(key);
            if (count > key[key.length-1]) {
                const nextkey=key.slice(0,key.length-1)
                nextkey.push( key[key.length-1] + 1) ;
                return nextkey;
            }
        } 
        const at=this.seqOf(key);
        return this.key(at+1);
    }
    siblingCount(key) {
        if (typeof key=='string') key=parseKey(key);
        let r=this.find(key);
        if (r[0]<0) return 0;
        r=this.find(key.slice(0,key.length-1) );
        const children=r[1];
        return key.length?children.length: (children.length - (children[0]?0:1) ); 
    }
    list() {
        return listKeys(this._getKeys())
    }
}
export class NestedOrderedListBuilder {
    constructor(opts) {
        this.opts=Object.assign({freeOrder:false,sep:'\t'},opts);

        let _values=[];
        let _keys=[];
        
        this._pushValue=val=>{_values.push(val);return _values.length}; //1
        this._getValue=i=>_values[i];
        this.itemCount=()=>_values.length;
        this._getValues=()=>_values;

        this.packValues=sep=>_values.join(sep||this.opts.sep);
        this._getKeys=()=>_keys;
        this._previous=[0];
    }
    packKeys(keys) { //no gap
        const out=[];
        let isint=0;
        keys=keys||this._getKeys();
        for (let i=0;i<keys.length;i++) {
            if (Array.isArray(keys[i])) break;
            isint++;
        }

        if (keys.length==isint) { //all item are range
            out.push(  -keys.length  )
        } else {
            for (let i=0;i<keys.length;i++) {
                if (Array.isArray(keys[i])) {
                    out.push( this.packKeys(keys[i]) ) ;
                } else { 
                    out[i]=keys[i] || 0;
                }
            }
        }
        if (out.length==1 && out[0]<=0) return out[0]
        return keys==this._getKeys()?JSON.stringify(out):out; 
        //root call, return serializable string
    }
    add( key , value){
        const nums=Array.isArray(key)?key:parseKey(key);
        if (!this.opts.freeOrder&&compareKey(this._previous,nums)>=0) {
            return false;
        }
        this._previous=nums;
        let keys=this._getKeys();
        for (let i=0;i<nums.length;i++){
            const n=nums[i];
            if (typeof n!=='number') throw "not number"
            if (typeof keys[n]=='undefined') {
                if (n<2 || typeof keys[n-1]!=='undefined' ) { //make sure no gap
                    keys[n]=this._pushValue(value);
                    return (i==nums.length-1);    
                }
            } else {
                if (!Array.isArray(keys[n])) {
                    keys[n]=[keys[n]]; //create a new level
                }
            }
            keys=keys[n];
            if (!keys) return false; //gap
        }

        return true;
    }
    list() {
        return listKeys(this._getKeys())
    }
}