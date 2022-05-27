import { fromSim } from "lossless-simplified-chinese";
import { getCriterion } from "../criteria/index.js";
import { PATHSEP ,VALUESEP,FULLTEXT_KEY} from "../platform/constants.js";
import { intersect, bsearch } from "../utils/index.js"
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
    criteria[FULLTEXT_KEY]=new FullTextSearch( {ptk});

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
    let books,chunks,excerpts=[];
    for (let method in ptk.criteria) {
        const criterion=ptk.criteria[method];
        const r=criterion&& criterion.result;
        if (r) {
            if (!chunks) chunks=criterion.query?r.chunks:null;
            else {
                //chunks.length for exact chunk id
                if (Array.isArray(chunks) && chunks.length>1 && criterion.query) { 
                    chunks=intersect(chunks,r.chunks);    
                }
            } 
        }
    }
    
    if(chunks) for (let i=0;i<chunks.length;i++) {
        const cl=ptk.getChunkLabel();
        const bk=ptk.bookOf( cl.linepos [ chunks[i]],true );
        if (!books) books=[];
        if (books[books.length-1]!==bk) books.push(bk);
    }
    const ft=this.criteria[FULLTEXT_KEY];
    if (ft.result&&ft.result.scores){
        excerpts=ft.result.scores.filter( ([y,score,chunk])=> ~bsearch(chunks,chunk) );
    }
    return [books||ptk.allBooks(), chunks||ptk.allChunks(), excerpts];
}

export function stringifyCriteria(attrs){
    const out=[];
    for (let n in attrs) {
        if (this.criteria[n]) {
            out.push(n+VALUESEP+attrs[n]);
        }
    }
    return out.join(PATHSEP);
}

export function parseCriteria(str){
    const items=str.split(PATHSEP);
    const out={};
    for (let i=0;i<items.length;i++) {
        const [key,value]=items[i].split(VALUESEP);
        if (this.criteria[key]) {
            out[key]=value;
        }
    }
    return out;
}

export function resetCriteria(){
    for (let method in this.criteria) {
        const criterion=this.criteria[method];
        criterion.result=null;
        criterion.query='';
    }
}
export default {registerCriteria,cascadeCriteria,FULLTEXT_KEY, 
    runCriteria,execCriterion, stringifyCriteria, parseCriteria, resetCriteria};