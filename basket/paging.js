import {PATHSEP,DELTASEP,DEFAULT_TREE} from '../platform/constants.js'
import { bsearch } from "../utils/bsearch.js" ;

function narrowDown(branches){
    let from=0,to=this.lastTextLine();
    for (let i=0;i<branches.length;i++){
        const {lbl, id , dy}=branches[i];

        const label=this.findLabel(lbl);
        if (!label) return [];
        const startfrom=bsearch(label.linepos,from,true);
        let at=label.idarr.indexOf(id, startfrom);
        if (at==-1) break;
        from=label.linepos[at]  + dy;
        to=label.linepos[at+1] || to;
    }
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
    const pths=addr.split(PATHSEP).filter(i=>!!i);
    const arr=pths.map((item,idx)=>{
        let pth=pths[idx];
        const m=pth.lastIndexOf(DELTASEP);
        let dy=m>-1?parseInt(pth.substr(m+1)):0;
        if (m>-1 && !isNaN(dy) ) {
            pth=pth.substr(0,m);
        }
        return {lbl:thetree[idx], id:pth , dy}
    })
    return this.narrowDown(arr);
}
function pageAt(y0){
    const out=[];
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    for (let i=0;i<thetree.length;i++){
        const label=this.findLabel(thetree[i]);
        const at=bsearch(label.linepos,y0+1,true);
        if (at<1) break;
        out.push([label.idarr[at-1], (i===thetree.length-1)?y0-label.linepos[at-1]:0 ]);
    }

    return out.map(i=>i[0]+ (i[1]?DELTASEP+i[1]:''));
}
function getTocTree(addr){
    const out=[{ptr:'',name:this.header.title }];
    if (!addr.trim())return out;
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=addr.split(PATHSEP);
    let ptr='';
    for (let i=0;i<parents.length;i++){
        const label=this.findLabel(thetree[i]);
        let at=label.idarr.indexOf(parents[i]);
        if (at==-1) break;
        let next=at;
        if (i==parents.length-1 && thetree.length==parents.length && next+1<label.idarr.length) next++;
        ptr=ptr+(ptr?PATHSEP:'')+(label.idarr[next].trim()||(DELTASEP+next));
        let name=label.names?label.names[at]:label.idarr[at];
        const at2=name.indexOf('　');
        if (at2>0 && name.length>10) name=name.substr(0,at2);
        out.push({name, n: at, ptr})
    }
    return out;
}
function fetchPage(loc){
    const out=[];
    let [y0,y1] = this.getPage(loc);
    if (y1==-1) y1=this.lastTextLine();

    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=loc.split(PATHSEP).filter(i=>!!i);
    if (parents.length<thetree.length) {
        const label=this.findLabel(thetree[parents.length]);
        if (label){
            const at=bsearch(label.linepos,y0,true);
            for (let i=at;i<label.linepos.length;i++) {
                if (y1>label.linepos[i]) {
                    const ptr=(loc?loc+PATHSEP:'')+(label.idarr[i]||DELTASEP+i);
                    out.push({key:(i+1),text:label.names?label.names[i]:label.idarr[i],ptr})
                }
            }        
        }
    } else {
        for (let i=y0;i<y1;i++) {
            out.push({key:i});
        }
    }
    return out;
}

export default {pageAt,getTocTree,fetchPage,getPage,narrowDown,locate}