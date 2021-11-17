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
        this.loadtime={};
        for (let f in paging) this[f]=paging[f];
        for (let f in entries) this[f]=entries[f];
        for (let f in pointers) this[f]=pointers[f];
        for (let f in mulus) this[f]=mulus[f];
        for (let f in inverted) this[f]=inverted[f];
    }
    init(){
        const section='labels'
        const self=this;
        let now=new Date();
        const promise=new Promise(resolve=>{
            self.openrom().then(function(){
                self.load(0).then(function(){
                    const at=self.header.title.indexOf(NAMESEP);
                    if (at>0) {
                        self.header.shorttitle=self.header.title.substr(at+1);
                        self.header.title=self.header.title.substr(0,at);
                    } else {
                        self.header.shorttitle=self.header.title.substr(0,2);
                    }
                    self.loadtime.open=new Date()-now; now= new Date();
                    self.loadSection(section,function(){
                        const labelSection=self.getSection(section);
                        const labelSectionRange=self.getSectionRange(section);
                        self.labels=deserializeLabels(labelSection,labelSectionRange,self.header.labels);
                        self.lblTransclusion=self.getLabel('t');
                        self.loadtime.labels=new Date()-now; now= new Date();
                        resolve(true); //resolve earlier, need to check if inverted ready
                        self.setupInverted(function(){
                            self.loadtime.inverted=new Date()-now;
                        });  
                    });
                });
            })
        });
        return promise;
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
    try {
        const success=await basket.init();
        if (success) { //a new pitaka is added to pool
            pool.add(name,basket);
            pool.getAll().forEach( ptk=>ptk.connect()); //tell other pitaka 
        }
    } catch(e) {
        console.error(e)
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