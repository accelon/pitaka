import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels} from './serialize-label.js';
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
export async function openBasket(name){
    if (pool.has(name)) return pool.get(name);
    const basket= new Basket({name});
    pool.add(name,basket);
    await basket.init();
    return basket;
}

export async function parse (basket_addr) {
    const [name,addr] = basket_addr.split('/');
    const basket=await openBasket(name);
    const r=basket.parse(addr);
    if (r) r.basket=name;
    return r;
}
export async function readLines (cap,max=100) {
    const basket=pool.get(cap.basket);
    let count=cap.eline?(cap.eline-cap.nline):1;
    if (count>max) count=max;
    const lines=await basket.readLines(cap.nline, count );
    return lines;
}