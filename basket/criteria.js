import { fromSim } from "lossless-simplified-chinese";
import { getCriterion } from "../criteria/index.js";
import { intersect } from "../utils/array.js"
import FullTextSearch from "../criteria/fulltext.js"
export function registerCriteria(){
    const ptk=this;
    const criteria={};

    //each criterion return a subset of chunk
    for (let i=0;i<this.labels.length;i++) {
        const label=this.labels[i];
        const criterionClass=getCriterion(label.criterion)
        if (criterionClass) {
            criteria[label.name] = new criterionClass({ptk,label});
        }
    }

    //full text search at the end
    criteria['*']=new FullTextSearch( {ptk});

    return criteria;
}
export async function execCriterion(method,query,opts) {
    const criterion=this.criteria[method];
    if (!criterion) {
        console.log("unknown criterion",method);
        return null;
    }
    let r=await criterion.exec(query,opts);
    if (r&&!r.count && query!==fromSim(query)) {
        r=await criterion.exec(fromSim(query),opts);
    }
    return r?Object.assign({},r,{basket:this.name,method}):null;
}
export async function runCriteria(query,opts){ //run all criteria with same query
    const out=[];
    for (let method in this.criteria){
        const r=await execCriterion.call(this,method,query,opts);
        out.push(r);
    }
    return out;
}
export async function cascadeCriteria(namedqueries,opts){
    const ptk=this;
    if (typeof namedqueries==='string') namedqueries=ptk.parseCriteria(namedqueries);
    for (let method in namedqueries) {
        const criterion=ptk.criteria[method];
        if (criterion) {
            await ptk.execCriterion(method, namedqueries[method], opts);
        }
    }
    let chunks;
    for (let method in ptk.criteria) {
        const criterion=ptk.criteria[method];
        const r=criterion&& criterion.result;
        if (r) {
            if (!chunks) chunks=r.all?r.all:r.chunks.map(i=>ptk.chunkOf(i));
            else {
                if (Array.isArray(chunks) && !r.all) {
                    chunks=intersect(chunks,r.chunks.map(i=>ptk.chunkOf(i)));    
                }
            } 
        }
    }
    return chunks;
}

export function stringifyCriteria(attrs){
    const out=[];
    for (let n in attrs) {
        if (this.criteria[n]) {
            out.push(n+'='+attrs[n]);
        }
    }
    return out.join('/');
}

export function parseCriteria(str){
    const items=str.split('/');
    const out={};
    for (let i=0;i<items.length;i++) {
        const [key,value]=items[i].split('=');
        if (this.criteria[key]) {
            out[key]=value;
        }
    }
    return out;
}

export default {registerCriteria,cascadeCriteria, runCriteria,execCriterion, stringifyCriteria, parseCriteria};