import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels} from './serialize-label.js';

class DB extends JSONPROM {
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
export async function open(name){
    if (pool.has(name)) return pool.get(name);
    const db= new DB({name});
    pool.add(name,db);
    await db.init();
    return db;
}

export async function parse (db_addr) {
    const [dbname,addr] = db_addr.split('*');
    const db=await open(dbname);
    const r=db.parse(addr);
    if (r) r.db=dbname;
    return r;
}
export async function readLines (cap,max=100) {
    const db=pool.get(cap.db);
    let count=cap.eline-cap.sline;
    if (count>max) count=max;
    const lines=await db.readLines(cap.sline, count );
    return lines;
}