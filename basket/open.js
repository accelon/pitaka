import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import { bsearch } from "../utils/bsearch.js";
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
            if (r) {
                //begin of labels section is end of text
                if (r.eline==-1) r.eline=this.header.sectionStarts[1];
                return r;
            }
        }
    }
    getLinksAtLine=nline=>{
        const links=[];
        const hrefs=this.labels[0].hrefs;
        if (!hrefs)return links;
        const {nsnline}=this.labels[0].header;
        let localns='';
        for (let i in nsnline) {
            if (nline>nsnline[i]) {
                localns=i;
            }
        }
        const {nlines,offsets,targets,lengths}=hrefs;
        const at=bsearch(hrefs.nlines,nline);
        let end=at+1;
        if (at>-1) {
            links.push( [offsets[at] , lengths[at], targets[at], localns ]);
            while (end<hrefs.nlines.length&&nlines[end]==nline) {
                links.push( [offsets[end] , lengths[end] ,targets[end] ,localns])
                end++
            }
        }
        return links;
    }
    namespaces(){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].parse("");
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
const MAXLINE=256;
export async function readLines ({basket,nline,eline,count=10}={}) {
    if (!basket )return;
    const bsk=pool.get(basket);
    count=eline?(eline-nline):(count||1);
    if (count>MAXLINE) count=MAXLINE;
    const lines=await bsk.readLines(nline, count );

    return lines;
}

export const opened=()=>{
    return pool.getAll();
}