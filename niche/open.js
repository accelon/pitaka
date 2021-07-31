import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels} from './serialize-label.js';
/*
   Niche is a read-only container
   of htll texts, prebuilt data-structure to facilitate fast access,
   and optional full text index.
*/
class Niche extends JSONPROM {
    constructor(opts) {
        super(opts)
        this.sections=[]
        this.labelTypes=[];
        this.labels={};
    }
    
    async init(){
        const section='labels'
        await this.load(0);
        await this.loadSection(section);
        const labelsection=this.getSection(section);
        const sectionRange=this.getSectionRange(section);
        this.labels=deserializeLabels(labelsection,sectionRange);
    }
    parse(str){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].parse(str);
            if (r) return r;
        }
    }
    locate(nline){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].locate(nline);
            if (r) return r;
        }
    }
}
export async function openNiche(name){
    if (pool.has(name)) return pool.get(name);
    const nich= new Niche({name});
    pool.add(name,nich);
    await nich.init();
    return nich;
}

export async function parse (niche_addr) {
    const [name,addr] = niche_addr.split('*');
    const nich=await open(name);
    const r=nich.parse(addr);
    if (r) r.nich=name;
    return r;
}
export async function readLines (cap,max=100) {
    const nich=pool.get(cap.nich);
    let count=cap.eline-cap.sline;
    if (count>max) count=max;
    const lines=await nich.readLines(cap.sline, count );
    return lines;
}