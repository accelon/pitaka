import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels} from './serialize-label.js';
import {NAMESEP} from '../platform/constants.js';
import paging from './paging.js';
import entries from './entries.js';
import pointers from './pointers.js';
import mulus from './mulus.js';
import inverted from './inverted.js';
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
        this.foreign={};        //search backlinks here
        this.futureforeign={};  //not in pool yet, to be check on every new ptk added to pool.
        this.lblTransclusion=null;
        this.inverted=null;
        this.loadtime=0;
        for (let f in paging) this[f]=paging[f];
        for (let f in entries) this[f]=entries[f];
        for (let f in pointers) this[f]=pointers[f];
        for (let f in mulus) this[f]=mulus[f];
        for (let f in inverted) this[f]=inverted[f];
    }
    async init(){
        const section='labels'
        try{
            this.loadtime=new Date();
            await this.openrom();
            await this.load(0);
            await this.loadSection(section);
            const labelSection=this.getSection(section);
            const labelSectionRange=this.getSectionRange(section);
            this.labels=deserializeLabels(labelSection,labelSectionRange,this.header.labels);

            this.lblTransclusion=this.getLabel('t');
            this.inverted=await this.loadInverted();

            const at=this.header.title.indexOf(NAMESEP);
            if (at>0) {
                this.header.shorttitle=this.header.title.substr(at+1);
                this.header.title=this.header.title.substr(0,at);
            } else {
                this.header.shorttitle=this.header.title.substr(0,2);
            }
            this.loadtime=new Date() - this.loadtime;
            return true;
        } catch(e){
            console.error(e)
        }
    }
    contentCount() {
        let lbl=this.getLabel('bk');
        if (!lbl) {
            lbl=this.getLabel('e');
        };
        if (!lbl)return 0;
        return lbl.linepos.length;
    }
    isDictionary(){
        return this.header.tree=='e'
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
    getLabel(name){
        for (let i=0;i<this.labels.length;i++) {
            if (this.labels[i].name==name) return this.labels[i];
        }
    }
    find(label,tofind,near) {
        const lbl=this.getLabel(label);
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
    if (success) { //a new pitaka is added to pool
        pool.add(name,basket);
        pool.getAll().forEach( ptk=>ptk.connect()); //tell other pitaka 
    }
    return basket;
}

export const openPointerBaskets=async arr=>{
    if (!Array.isArray(arr)) arr=[arr];
    const pitakas={};
    for (let i=0;i<arr.length;i++) {
        let ptr=arr[i];
        if (ptr[0]==PATHSEP) {
            const pths=ptr.split(PATHSEP);
            pths.shift(); //drop leading PATHSEP
            pitakas[pths.shift()]=true;
        }
    }
    const jobs=[];
    for (let name in pitakas) {
        if (!pool.has(name)) jobs.push(openBasket(name));
    }
    await Promise.all(jobs);
}