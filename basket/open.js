import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import { bsearch } from "../utils/bsearch.js" ;
import {deserializeLabels} from './serialize-label.js';
import {DEFAULT_TREE} from './config.js';
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
    getLinksAtLine(nline){
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
    findLabel(name){
        for (let i=0;i<this.labels.length;i++) {
            if (this.labels[i].name==name) return this.labels[i];
        }
    }
    getName(tag) {
        const m=tag.match(/([a-z]+)(\d+)/);
        if (!m)return '';
        const label=this.findLabel(m[1]);
        if (!label)return;

        const at=label.idarr.indexOf(m[2]);
        if (at>-1) {
            return label.names[at];
        }
        return '';
    }
    getTocTree(addr) {
        const out=[{address:'',name:this.header.title }];
        if (!addr.trim())return out;
        const thetree=(this.header.tree||DEFAULT_TREE).split(',');
        const parents=addr.split(',');
        let address='';
        for (let i=0;i<parents.length;i++){
            const label=this.findLabel(thetree[i]);
            let at=label.idarr.indexOf(parents[i]);
            if (at==-1) break;
            let next=at;
            if (i==parents.length-1 && thetree.length==parents.length && next+1<label.idarr.length) next++;
            address=address+(address?',':'')+(label.idarr[next].trim()||(':'+next));
            let name=label.names[at];
            const at2=name.indexOf('　');
            if (at2>0 && name.length>10) name=name.substr(0,at2);
            out.push({name, n: at, address})
        }
        return out;
    }
    fetch(addr){
        const thetree=(this.header.tree||DEFAULT_TREE).split(',');
        if (!addr) {
            const label=this.findLabel(thetree[0]);
            return label.names.map((nm,key)=>{
                const address=label.idarr[key];
                return { key:key+1 , text:nm, address }
            })
        } else {
            const pth=addr.split(',');
            let y0=0,y1=-1;
   
            for (let i=0;i<pth.length;i++) {
                const label=this.findLabel(thetree[i]);
                const id=pth[i];
                let at=-1;
                if (id[0]==':') { // by nth
                    at=parseInt(id.substr(1));
                } else {
                    const from=bsearch(label.linepos,y0,true);
                    at=label.idarr.indexOf(id,from);
                }
                if (at>-1) {
                    y0=label.linepos[at];
                    y1=label.linepos[at+1]||-1;
                }
            }

            if (y1==-1) y1=(this.header.sectionStarts[1]||this.header.lineCount)-1;
            const out=[];
            if (pth.length<thetree.length) {
                const label=this.findLabel(thetree[pth.length]);
                const at=bsearch(label.linepos,y0,true);
                for (let i=at;i<label.linepos.length;i++) {
                    if (y1>label.linepos[i]) {
                        const address=addr+','+(label.idarr[i].trim()||':'+i);
                        out.push({key:(i+1),text:label.names[i],address})
                    }
                }
            } else { //fetch a page
                for (let i=y0;i<y1;i++) out.push({key:i});
            }
            return out;
        }
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
    if (!bsk) {
        console.error('basket not open',basket)
        return [];
    }
    count=eline?(eline-nline):(count||1);
    if (count>MAXLINE) count=MAXLINE;
    const lines=await bsk.readLines(nline, count );

    return lines;
}

export const opened=()=>{
    return pool.getAll();
}

