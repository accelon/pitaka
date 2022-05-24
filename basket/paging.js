import {PATHSEP,NAMESPACESEP,DELTASEP,LOCATORSEP,DEFAULT_LOCATOR,RANGESEP,NAMESEP,FOOTNOTE_SUFFIX} from '../platform/constants.js'
import {parseAddress,parseOfftextLine} from '../offtext/index.js'
import { bsearch } from "../utils/bsearch.js" ;

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
        if (label.range) {
            while (at<label.linepos.length &&label.linepos[at+1]==label.linepos[at]) {
                at++;
            }
        }
        to=label.linepos[at+1] || to;
    }
    if (!to|| to==-1) y1=this.lastTextLine();
    return [from,to];
}
/*  use pageAt
function locate(y){
    const thetree=(this.header.locator||DEFAULT_LOCATOR).split(PATHSEP);
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
function locY(addr){
    const ptr=parseAddress(addr);
    if (!ptr) return 0;
    return this.getPageRange(ptr.loc)[0]+ptr.dy;
}
function getPageRange(addr){
    let thetree=(this.header.locator||DEFAULT_LOCATOR);
    if (typeof thetree==='string') thetree=thetree.split(LOCATORSEP);
    if (!addr && thetree[0]=='e') return [0,0];
    const pths=(addr||'').split(LOCATORSEP).filter(i=>!!i);
    const arr=pths.map((item,idx)=>{
        let pth=pths[idx];
        let id=pth;
        let lbl=thetree[idx];
        const eq=id.indexOf('=');
        if (eq>0) {
            lbl=id.substr(0,eq);
            id=id.substr(eq+1);
        }
        return {lbl, id }
    })
    const nextlbl=thetree[pths.length]||'';
    return [...this.narrowDown(arr) ,  nextlbl ] ;
}
function chunkOf(y_loc, idxonly=false){
    let y=y_loc;
    if (!y_loc) return;
    if (typeof y!=='number') y=this.locY(y_loc);
    const cl=this.getChunkLabel();
    const at=bsearch(cl.linepos,y+1,true)-1;
    const id=cl.idarr[at];
    const address=this.bookOf(y_loc).id+LOCATORSEP+id;
    return idxonly?at:{id, at, dy:y-cl.linepos[at], address, name:cl.names[at]};
}
function chunkLinepos(ck){
    const cl=this.getChunkLabel();
    return cl.linepos[ck];
}
function allChunks(){
    if (!this.cache.chunks) {
        this.cache.chunks=this.getChunkLabel().names.map((c,idx)=>idx);
    }
    return this.cache.chunks;
}
function allBooks(){
    if (!this.cache.books) {
        this.cache.books=this.getBookLabel().idarr.map((c,idx)=>idx);
    }
    return this.cache.books;
}
function getBook(arr){
    let single=false;
    if (typeof arr=='number') {
        single=true;
        arr=[arr];
    }
    const lbl=this.getBookLabel();
    const r=arr.map(at=>{return {at, name , id:lbl.idarr[at],name:lbl.names[at]}});
    return single?r[0]:r;
}
function locOf(y,nonamespace=false,nody=false){
    const arr=this.closest(y,this.header.locator);
    const out=arr.map(it=>it.id);
    let dy=0;
    let s=out.join(LOCATORSEP);
    if (arr.length && !nody) {
        dy=y-arr[arr.length-1].line;
        if (dy>0) s+=NAMESPACESEP+dy;
    }
    return nonamespace?s:this.name+NAMESPACESEP+s;
}
function dyOf(y_loc) {
    if (typeof y_loc==='string') {
        const arr=y_loc.split(PATHSEP);
        const tree=(this.header.locator||DEFAULT_LOCATOR).split(LOCATORSEP)
        return (arr.length>tree.length)?parseInt(arr[tree.length]):0;
    } else if (typeof y_loc==='number') {
        const page=pageLoc.call(this,y_loc);
        const [from]=getPageRange.call(this,page);
        return y_loc-from;    
    }
}
function bookOf(y_loc,idxonly=false) {
    let y=y_loc;
    if (typeof y_loc=='string') {
        y=this.locY(y_loc);
    }
    if (!this.cache.labelBook) {
        this.cache.labelBook=this.findLabelType('LabelBook');
    }
    const lbl=this.cache.labelBook;
    let at=bsearch(lbl.linepos,y+1, true)-1;
    if (at<0) return null;
    return idxonly?at:{at,id:lbl.idarr[at], name:lbl.names[at]};
}
function pageLoc(y_loc){ //loc without line delta and ptkname
    let loc='';
    if (typeof y_loc==='number') {
        const arr=this.closest(y_loc,(this.header.locator||DEFAULT_LOCATOR));
        loc=arr.map(it=>it.id).join(LOCATORSEP);
    } else {
        return y_loc;
        // const arr=y_loc.split(PATHSEP);
        // const thetree=(this.header.locator||DEFAULT_LOCATOR).split(LOCATORSEP);
        // arr.length=thetree.length;
        // loc=arr.join(PATHSEP);
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
    let startfrom=0;
    for (let i=0;i<labels.length;i++){
        const label=this.getLabel(labels[i]);
        const idx=bsearch(label.linepos,y0+1,true);
        if (idx<0) break;
        
        const parentidx=bsearch(label.linepos,startfrom,true);
        const id=label.idarr?label.idarr[idx-1]:(idx-parentidx);
        const line=label.linepos[idx-1];
        const name=label.names?label.names[idx-1]:'';
        //line is smaller than y0
        out.push({id,idx,delta:0,caption:label.caption,lblname:labels[i], name, y0,line});
        startfrom=label.linepos[idx-1];
    }
    
    
    for (let i=0;i<out.length;i++) {
        const label=this.getLabel(labels[i]);
        if (label.resets) {
            if (typeof label.resets=='string') label.resets=[label.resets];
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
function getTocTreeDef(){
    return (this.header.addressing||DEFAULT_LOCATOR).split(PATHSEP);
}
function getTocTree(addr,locOnly=false){
    if (!addr) addr='';
    const out=[{ptr:'/',name:this.header.shorttitle }];
    if (!addr.trim())return out;
    const thetree=(this.header.addressing||DEFAULT_LOCATOR).split(LOCATORSEP);
    const parents=addr.split(LOCATORSEP);
    let ptr=''; //pointer to next juan
    let parentfrom=0;
    for (let i=0;i<parents.length-1;i++){
        const label=this.getLabel(thetree[i]);
        if (label.idarr) {
            let id=parents[i],at;
            if (id[0]!==DELTASEP) {
                let from=0;
                if (parentfrom) {
                    from=bsearch(label.linepos,parentfrom,true);
                }
                at=label.idarr.indexOf(id,from);
            } else at=parseInt(id.substr(1));
            if (at==-1) break;
            parentfrom=label.linepos[at];
            let next=at;
            if (i==parents.length-1 && thetree.length==parents.length && next+1<label.idarr.length) next++;
            
            let name=label.names?label.names[at]:label.idarr[at];
            const at2=name?name.indexOf(NAMESEP):0;
            if (at2>0) name=name.substr(at2+1);
            out.push({name, n: at, ptr})
            ptr=ptr+(ptr?LOCATORSEP:'')+(label.idarr[next].trim()||(DELTASEP+next));
        } else {
            const n=parseInt(parents[i]);
            if (n<label.linepos.length-1) { //need to check boundary of parent
                ptr=ptr+(ptr?LOCATORSEP:'')+(n+1);
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
    
    const thetree=(this.header.addressing||DEFAULT_LOCATOR).split(PATHSEP);
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

    const thetree=(this.header.addressing||DEFAULT_LOCATOR).split(PATHSEP);
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
    const thetree=(this.header.addressing||DEFAULT_LOCATOR).split(PATHSEP);
    if (pths.length>=thetree.length) { //up one level 
        pths.pop();
        loc=pths.join(PATHSEP);
    }

    const [from,to,nextlbl]=this.getPageRange(loc);
    const label=this.getLabel(nextlbl);
    if (!label) return 0;
    return label.countRange(from,to);
}
async function fetchFootnote(y0,fn){
    let loc=parseAddress(this.locOf(y0)).loc;
    if (loc.indexOf(FOOTNOTE_SUFFIX)==-1) {
        loc=loc.replace(LOCATORSEP,FOOTNOTE_SUFFIX+LOCATORSEP);
    } 
    loc+=LOCATORSEP+'fn='+fn;
    //TODO 同頁/同卷注

    const ranges=this.getPageRange(loc);
    let count=ranges[1]-ranges[0];
    if (count>10 ) count=10;
    let hlines=await this.readLines(ranges[0],count);
    const out=hlines.map(it=>{ return {key: it[0], text:it[1]} });
    return out;
}
function enumLocators(filter=null){ //only support two level addressing
    const thetree=(this.header.locator||DEFAULT_LOCATOR).split(LOCATORSEP);
    const out=[];
    if (filter) {
        if (typeof filter=='string') filter=new RegExp(filter);
    }
    for (let i=0;i<thetree.length-1;i++) { 
        const t=thetree[i];
        const lbl=this.getLabel(t);
        const nextlbl=this.getLabel(thetree[i+1]);

        for (let j=0;j<lbl.idarr.length;j++) {
            if (filter && !lbl.idarr[j].match(filter)) continue;
            if (nextlbl) {
                const [from,to]=this.getLabelLineRange(lbl,j)
                const start=bsearch(nextlbl.linepos,from);
                const end=bsearch(nextlbl.linepos,to);
                let k=start;
                while (k<end) {
                    let subid=k+1-start;
                    if (nextlbl.idarr) {
                        subid=nextlbl.idarr[k];
                    }
                    let n=k+1, id=subid;
                    if (nextlbl.range) {
                        while (n<end && nextlbl.linepos[n]==nextlbl.linepos[k]) n++;
                        if (n>k+1) id=subid+ RANGESEP+ ( n-k+subid-1 );
                    }
                    out.push(lbl.idarr[j]+LOCATORSEP+id);
                    k=n;
                }
            } else {
                out.push(lbl.idarr[j]);
            }
        }
    }
    return out;
}
async function readLoc(loc){
    const [y0,y1] = this.getPageRange(loc);
    return (await this.readLines(y0,y1-y0)).map(it=>it[1]);
}
function headingOf(y_loc){
    let y=y_loc;
    if (typeof y!=='number') y=this.locY(y_loc);

    let linepos,names;
    if (this.headingsLinepos && this.headingsLinepos.length) {
        names=this.headings;
        linepos=this.headingsLinepos;
    } else {
        const lbl=this.getHeadingLabel();
        names=lbl.names;
        linepos=lbl.linepos;
    }
    if (!y) return ['',-1,0];
    let at=bsearch(linepos,y,true);
    if (at&&linepos[at]>y) at--;
    const rawtext=names[at]
    const [text]=parseOfftextLine(rawtext);
    return {text, rawtext,  at, idx:linepos[at]-y, y };
}

export default {closest,getTocTreeDef,getTocTree,getNChild,childCount,dyOf,locOf,chunkOf,pageLoc,
    fetchPage,fetchToc,fetchFootnote,getPageRange,narrowDown,getLabelLineRange,locY,
enumLocators,readLoc,headingOf,bookOf,chunkLinepos,allChunks,getBook,allBooks}