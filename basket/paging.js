import {PATHSEP,DELTASEP,DEFAULT_TREE} from '../platform/constants.js'
import { bsearch } from "../utils/bsearch.js" ;

function narrowDown(branches){
    let from=0,to=this.lastTextLine();
    for (let i=0;i<branches.length;i++){
        const {lbl, id , dy}=branches[i];

        const label=this.findLabel(lbl);
        if (!label) return [];
        const startfrom=bsearch(label.linepos,from,true);
        let at;
        if (label.idarr && id[0]!==DELTASEP) {  // leading : go to nth child
            at=label.idarr.indexOf(id, startfrom);
            if (at==-1) break;
        } else {
            at=startfrom+parseInt(id.substr(id[0]==DELTASEP?1:0));
        }
        from=label.linepos[at]  + dy;
        to=label.linepos[at+1] || to;
    }
    if (!to|| to==-1) y1=this.lastTextLine();
    return [from,to];
}
function locate(y){
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const out=[];
    for (let i=0;i<thetree.length;i++) {
        const lbl=this.findLabel(thetree[i]);
        const at=bsearch(lbl.linepos, y , true);
        const dy= (i===thetree.length-1)?(y-lbl.linepos[at-1]):0 ; //dy for last tree node
        out.push(lbl.idarr[at-1]+(dy? DELTASEP+dy:''));
    }
    return out;
}
function getPage(addr){
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    if (!addr && thetree[0]=='e') return [0,0];
    const pths=(addr||'').split(PATHSEP).filter(i=>!!i);
    const arr=pths.map((item,idx)=>{
        let pth=pths[idx];
        const m=pth.lastIndexOf(DELTASEP);
        let dy=m>1?parseInt(pth.substr(m+1)):0;
        if (m>1 && !isNaN(dy) ) {
            pth=pth.substr(0,m);
        }
        return {lbl:thetree[idx], id:pth , dy}
    })
    let nextlbl=thetree[pths.length];
    return [...this.narrowDown(arr) ,  nextlbl] ;
}
function pageAt(y0){
    const out=[];
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    let parentat=0;
    for (let i=0;i<thetree.length;i++){
        const label=this.findLabel(thetree[i]);
        const at=bsearch(label.linepos,y0+1,true);
        if (at<1) break;
        const from=bsearch(label.linepos,parentat,true);
        const id=label.idarr?(label.idarr[at-1] ): (DELTASEP+(at-from-1));
        out.push([id, (i===thetree.length-1)?y0-label.linepos[at-1]:0 ]);
        parentat=label.linepos[at-1];
    }

    return out.map(i=>i[0]+ (i[1]?DELTASEP+i[1]:''));
}
function getTocTree(addr){
    if (!addr) addr='';
    const out=[{ptr:'/',name:this.header.title }];
    if (!addr.trim())return out;
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=addr.split(PATHSEP);
    let ptr=''; //pointer to next juan
    for (let i=0;i<parents.length-1;i++){
        const label=this.findLabel(thetree[i]);
        if (label.idarr) {
            let id=parents[i],at;
            if (id[0]!==DELTASEP) {
                at=label.idarr.indexOf(id);
            } else at=parseInt(id.substr(1));
            if (at==-1) break;
            let next=at;
            if (i==parents.length-1 && thetree.length==parents.length && next+1<label.idarr.length) next++;
            
            let name=label.names?label.names[at]:label.idarr[at];

            out.push({name, n: at, ptr})
            ptr=ptr+(ptr?PATHSEP:'')+(label.idarr[next].trim()||(DELTASEP+next));
        } else {
            const n=parseInt(parents[i]);
            if (n<label.linepos.length-1) { //need to check boundary of parent
                ptr=ptr+(ptr?PATHSEP:'')+(n+1);
            }            
            out.push({name:parents[i], n: i, ptr})
        }
        
    }
    return out;
}

function fetchToc(loc){
    const out=[];
    if (!loc) loc='';
    let [y0,y1] = this.getPage(loc);
    
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=loc.split(PATHSEP).filter(i=>!!i);

    const label=this.findLabel(thetree[parents.length]);
    if (label){
        const at=bsearch(label.linepos,y0,true);
        for (let i=at;i<label.linepos.length;i++) {
            if (y1>label.linepos[i]) {
                const chunk=(label.idarr&&label.idarr[i]||(i-at));
                let ptr=(loc?loc+PATHSEP:'')+chunk;
                let childcount=0;
                if (parents.length<thetree.length-1) {
                    let from=label.linepos[i];
                    let to=label.linepos[i+1];
                    if (!to) to==this.lastTextLine();
                    const clabel=this.findLabel(thetree[parents.length+1]);
                    childcount=clabel.countRange(from,to );
                }
                const id=label.idarr?label.idarr[i]:'';
                out.push({key:(i+1),id,text:label.names?label.names[i]:(':'+chunk),ptr,childcount});
            } else break;
        }        
    }
    return out;
}
function fetchPage(loc){
    if (!loc) loc='';
    const out=[];
    let [y0,y1] = this.getPage(loc);

    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=loc.split(PATHSEP).filter(i=>!!i);
    if (parents.length<thetree.length) {
        return this.fetchToc(loc);
    } else {
        for (let i=y0;i<y1;i++) {
            out.push({key:i});
        }
    }
    return out;
}
function getNChild(loc,n){
    const [from,to,nextlbl]=this.getPage(loc);
    const label=this.findLabel(nextlbl);
    if (!label) return {};
    const at=bsearch(label.linepos,from,true);
    const i=at+n;
    const ptr=loc+PATHSEP+':'+n;
    const id=(label.idarr&&label.idarr[i])||(n+1);
    const name=(label.names&&label.names[i])||'卷 Juan '+(n+1);

    return { id, name,ptr }
}
function childCount(loc){
    if (!loc)return 0;
    const pths=loc.split(PATHSEP);
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    if (pths.length>=thetree.length) { //up one level 
        pths.pop();
        loc=pths.join(PATHSEP);
    }

    const [from,to,nextlbl]=this.getPage(loc);
    const label=this.findLabel(nextlbl);
    if (!label) return 0;
    return label.countRange(from,to);
}
export default {pageAt,getTocTree,getNChild,childCount,fetchPage,fetchToc,getPage,narrowDown,locate}