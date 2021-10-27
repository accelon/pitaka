import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings} from'../utils/index.js';

class LabelBook extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.keywords={}; // forward index of keywords  nbook: array of keyword idx
        this._maxkeyword=0;
        return this;
    }
    action(tag ,linetext){
        let {y,x,w}=tag;
        const id=(tag.attrs.id||tag.attrs.n)||' ';
        if (w==0) w=linetext.length;
        const bkname=linetext.substr(x,w);
        
        this.names.push(bkname);
        this.linepos.push(y);
        if (this._idarr[id]) throw 'repeated bk id, '+id+' at '+linetext;

        this._idarr[id]=y;
        this.idarr.push(id);
    }
    addKeywords(name,keywords){ // keywords:[array of book id] from LabelKeyword 
        this.keywords[name]=[];
        for (let idx=0;idx<keywords.length;idx++) {
            const arrbk=keywords[idx][1];
            for (let i=0;i<arrbk.length;i++) {
                const nbk=parseInt(arrbk[i]);
                if (!this.keywords[name][nbk]) this.keywords[name][nbk]=[];
                this.keywords[name][nbk].push(idx);
            }
        }  
    }
    serialize_keywords(){
        const labelsout=[];
        const keylabels=Object.keys(this.keywords);
        //每本書最多有幾個keyword
        for (let i=0;i<keylabels.length;i++) {
            const keylabel=keylabels[i]
            const keywords=this.keywords[keylabel];
            for (let j=0;j<keywords.length;j++) {
                const keyidarr=keywords[j];
                if (keyidarr&&keyidarr.length>this._maxkeyword) {
                    this._maxkeyword=keyidarr.length;
                }
            }
        }

        for (let i=0;i<keylabels.length;i++) {
            const keylabel=keylabels[i]
            const keywords=this.keywords[keylabel];
            const labelout=[];

            for (let j=0;j<keywords.length;j++) {
                const keyidarr=keywords[j];
                if (typeof keyidarr=='undefined') { //no keywords in this book
                    labelout.push(0);               //separator
                } else {
                    if (keyidarr.length==1) { //通常只有一個keyword，加上maxkeyword 
                        labelout.push(keyidarr[0]+this._maxkeyword+1)
                     } else if (keyidarr.length>1) {
                        labelout.push(keyidarr.length); //一本書多個keyword 情況
                        keyidarr.forEach(item=>labelout.push(item));
                    } else {
                        throw "empty keyidarr "+keylabel;
                    }
                }
            }
            labelsout.push(pack(labelout));
        }
        return {keylabels,labelsout};
    }
    serialize(){
        const {keylabels,labelsout}=this.serialize_keywords();
        const out=[];
        out.push(JSON.stringify({keywords:keylabels.length,maxkeyword:this._maxkeyword}) );
        out.push(packStrings(this.names));
        out.push(pack_delta(this.linepos)); 
        out.push(packStrings(this.idarr));
        out.push(keylabels.join('\t'));
        out.push(...labelsout)
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const options=JSON.parse(payload[at++]);payload[at-1]='';
        this.names=unpackStrings(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=unpackStrings(payload[at++]);payload[at-1]='';
    
        if (options.keywords) {
            const keylabels=payload[at++].split('\t') ;payload[at-1]='';
            for (let i=0;i<keylabels.length;i++) {
                const arr=unpack(payload[at++]);payload[at-1]='';
                let out=[];
                let nbk=0,j=0;
                while (j<arr.length) {
                    let int=arr[j];
                    if (int===0) { //no keywords
                    } else if (int<=options.maxkeyword) {
                        out[nbk]=arr.slice(j+1,j+int+1);
                        j+=int;
                    } else {
                        out[nbk]=int-options.maxkeyword-1;
                    }
                    nbk++;
                    j++;
                }
                this.keywords[keylabels[i]]= out;
            }
        }
        return at;
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize(){
        this.log('finalize book')
    }
}
export default LabelBook;