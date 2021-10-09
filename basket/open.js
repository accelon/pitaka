import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels} from './serialize-label.js';
import paging from './paging.js';
import entries from './entries.js';
/*
   Basket is a read-only container
   of htll texts, prebuilt data-structure to facilitate fast access,
   and optional full text index.
*/
class Basket extends JSONPROM {
    constructor(opts) {
        super(opts)
        this.sections=[]
        this.labelTypes=[];
        this.labels={};
        for (let f in paging) this[f]=paging[f];
        for (let f in entries) this[f]=entries[f];
    }
    async init(){
        const section='labels'
        try{
            await this.openrom();
            await this.load(0);
            await this.loadSection(section);
            const labelsection=this.getSection(section);
            const sectionRange=this.getSectionRange(section);
            this.labels=deserializeLabels(labelsection,sectionRange);    
            return true;
        } catch(e){
            console.error(e)
        }
    }
    parse(str){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].parse(str);
            if (r) {
                //begin of labels section is end of text
                if (r.eline==-1) r.eline=this.header.sectionStarts[1];
                return r;
            }
        }
    }
    locate(nline){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].locate(nline);
            if (r) return r;
        }
    }
    findLabel(name){
        for (let i=0;i<this.labels.length;i++) {
            if (this.labels[i].name==name) return this.labels[i];
        }
    }
    find(label,tofind,near) {
        const lbl=this.findLabel(label);
        if (!lbl)return null;
        return lbl.find(tofind,near);
    }
    lastTextLine(){
        return (this.header.sectionStarts[1]||this.header.lineCount)-1;
    }
}
export async function openBasket(name){
    if (pool.has(name)) {
        // console.log('reuse',name)
        return pool.get(name);
    }
    const basket= new Basket({name});
    const success=await basket.init();
    if (success) pool.add(name,basket);
    return basket;
}