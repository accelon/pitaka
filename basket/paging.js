import {PATHSEP,DELTASEP,DEFAULT_TREE,NAMESEP} from '../platform/constants.js'
import {parseOffTag} from '../offtext/index.js'
import { bsearch } from "../utils/bsearch.js" ;
import { parseAddress } from '../offtext/pointers.js';

function narrowDown(branches){
    let from=0,to=this.lastTextLine();
    for (let i=0;i<branches.length;i++){
        const {lbl, id }=branches[i];
        const label=this.getLabel(lbl);
        if (!label) break;
        const startfrom=bsearch(label.linepos,from,true);
        let at;
        if (label.idarr) {  // leading : go to nth child
            at=label.idarr.indexOf(id, startfrom);
            if (at==-1) break;
        } else {
            at=startfrom+(label.indexOf?label.indexOf(id):parseInt(id)-1); //without DELTASEP is 1 base
        }
        from=label.linepos[at] ;
        to=label.linepos[at+1] || to;
    }
    if (!to|| to==-1) y1=this.lastTextLine();
    return [from,to];
}
/*  use pageAt
function locate(y){
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const out=[];
    for (let i=0;i<thetree.length;i++) {
        const lbl=this.getLabel(thetree[i]);
        const at=bsearch(lbl.linepos, y , true);
        const dy= (i===thetree.length-1)?(y-lbl.linepos[at-1]):0 ; //dy for last tree node
        const id=lbl.idarr?lbl.idarr[at-1]:at; //if idarr is missing , at is 1-base nth chapter
        out.push(id+(dy ? DELTASEP+dy:'') ) ;
    }
    return out;
}
*/
function getLabelLineRange(lbl,n){
    if (typeof lbl==='string') {
        lbl=this.getLabel('bk');
    }
    return [lbl.linepos[n],lbl.linepos[n+1]]
}
function getPageRange(addr){
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    if (!addr && thetree[0]=='e') return [0,0];
    const pths=(addr||'').split(PATHSEP).filter(i=>!!i);
    const arr=pths.map((item,idx)=>{
        let pth=pths[idx];
        let id=pth;
        let lbl=thetree[idx];

        const eq=id.indexOf('#');
        if (eq>0) {
            const [labelname,attrs]=parseOffTag(id.substr(0,eq)+id.substr(eq+1));
            id=attrs.n;
            lbl=labelname;
        // } else {
        //     const m=pth.lastIndexOf(DELTASEP);
        //     dy=m>1?parseInt(pth.substr(m+1)):0;
        //     if (m>1 && !isNaN(dy) ) {
        //         pth=pth.substr(0,m);
        //     }
        }
        return {lbl, id }
    })
    const nextlbl=thetree[pths.length]||'';
    return [...this.narrowDown(arr) ,  nextlbl ] ;
}
function clusterOf(y){
    const cl=this.getClusterLabel();
    const at=bsearch(cl.linepos,y,true)-1;
    return {id:cl.idarr[at], at};
}
function locOf(y,full=false){
    const arr=this.closest(y,(this.header.tree||DEFAULT_TREE).split(PATHSEP));
    const out=arr.map(it=>it.id);
    const delta=y-arr[arr.length-1].line;
    if (delta>1) out.push(delta-1);
    const s=out.join(PATHSEP);
    return full?this.name+PATHSEP+s:s;
}
function pageLoc(y_loc){ //loc without line delta and ptkname
    let loc='';
    if (typeof y_loc==='number') {
        const arr=this.closest(y,(this.header.tree||DEFAULT_TREE).split(PATHSEP));
        loc=arr.map(it=>it.id).join(PATHSEP);
    } else {
        const arr=y_loc.split(PATHSEP);
        const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
        arr.length=thetree.length;
        loc=arr.join(PATHSEP);
    }
    return loc;
}
function closest(y0,labels){
    let out=[];
    if (!y0) return [];

    if (!labels) {
    	labels=[];
    	this.labels.forEach(lbl=>{
    		if (lbl.linepos && !lbl.notquickpointer) {
    			labels.push(lbl.name);
    		}
    	});
    }
    for (let i=0;i<labels.length;i++){
        const label=this.getLabel(labels[i]);
        const idx=bsearch(label.linepos,y0,true);

        if (idx<0) break;
        
        const id=label.idarr?label.idarr[idx-1]:idx;
        const line=label.linepos[idx-1];
        const name=label.names?label.names[idx-1]:'';
        //line is smaller than y0
        out.push({id,idx,delta:0,caption:label.caption,lblname:labels[i], name, y0,line});
    }
    
    
    for (let i=0;i<out.length;i++) {
        const label=this.getLabel(labels[i]);
        if (label.resets) {
            label.resets.forEach(l=>{
                const at=labels.indexOf(l);
                if (at===-1) return;
                const reseting=this.getLabel(labels[at]);
                const firstChild=bsearch(reseting.linepos, out[i].line,true  ); //找最近 bk 的 c
                let delta=out[at].idx-firstChild;
                out[at].id=delta;
                if (reseting.cols>1) { //reverse operation of LabelPage.npage
                    if(delta)delta--; //delta might be 0
                    const col=(delta % reseting.cols)
                    out[at].id=(Math.floor( delta / reseting.cols)+1) + String.fromCharCode(0x61+col);
                }
            })
        }
    }
    
    return out;
}
function getTocTree(addr,locOnly=false){
    if (!addr) addr='';
    const out=[{ptr:'/',name:this.header.shorttitle }];
    if (!addr.trim())return out;
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=addr.split(PATHSEP);
    let ptr=''; //pointer to next juan
    for (let i=0;i<parents.length-1;i++){
        const label=this.getLabel(thetree[i]);
        if (label.idarr) {
            let id=parents[i],at;
            if (id[0]!==DELTASEP) {
                at=label.idarr.indexOf(id);
            } else at=parseInt(id.substr(1));
            if (at==-1) break;
            let next=at;
            if (i==parents.length-1 && thetree.length==parents.length && next+1<label.idarr.length) next++;
            
            let name=label.names?label.names[at]:label.idarr[at];
            const at2=name.indexOf(NAMESEP);
            if (at2>0) name=name.substr(at2+1);
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
    if (locOnly) out.shift();
    return out;
}

function fetchToc(loc){
    const out=[];
    if (!loc) loc='';
    let [y0,y1] = this.getPageRange(loc);
    
    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=loc.split(PATHSEP).filter(i=>!!i);

    const label=this.getLabel(thetree[parents.length]);
    if (!label) return out;
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
                const clabel=this.getLabel(thetree[parents.length+1]);
                childcount=clabel.countRange(from,to );
            }
            let keywords=[];
            if (label.keywords) {
                for (let keylabel in label.keywords) {
                    const nkeyword=label.keywords[keylabel][i]; 
                    const lbl=this.getLabel(keylabel);
                    if (nkeyword && nkeyword.length) {
                        nkeyword.forEach( n=>{
                            keywords.push([keylabel, lbl.keys[n]]);
                        });
                    } else if (!isNaN(nkeyword)) {
                        keywords.push([keylabel, lbl.keys[nkeyword]]);
                    }
                }
            }
            const id=label.idarr?label.idarr[i]:'';
            let text=label.names?label.names[i]:(':'+chunk);
            const at2=text.indexOf(NAMESEP);
            if (at2>0) text=text.substr(0,at2);
            out.push({key:(i+1),id,text,ptr,childcount,keywords});
        } else break;
    }        
    return out;
}
function fetchPage(loc){
    if (!loc) loc='';
    const out=[];
    let [y0,y1] = this.getPageRange(loc);

    const thetree=(this.header.tree||DEFAULT_TREE).split(PATHSEP);
    const parents=loc.split(PATHSEP).filter(i=>!!i);
    if (parents.length<thetree.length) {
        return this.fetchToc(loc);
    } else {
        for (let i=y0;i<y1;i++) {
            out.push({key:i,backlinks:null});
        }
    }
    return out;
}
function getNChild(loc,n){
    const [from,to,nextlbl]=this.getPageRange(loc);
    const label=this.getLabel(nextlbl);
    if (!label) return {};
    const at=bsearch(label.linepos,from,true);
    const i=at+n;
    const ptr=loc+PATHSEP+':'+n;
    const id=(label.idarr&&label.idarr[i])||(n+1);
    const name=label.names&&label.names[i];

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

    const [from,to,nextlbl]=this.getPageRange(loc);
    const label=this.getLabel(nextlbl);
    if (!label) return 0;
    return label.countRange(from,to);
}
export default {closest,getTocTree,getNChild,childCount,locOf,clusterOf,pageLoc,
    fetchPage,fetchToc,getPageRange,narrowDown,getLabelLineRange}