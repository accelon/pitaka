const unhide=ctx=>{ (ctx.hide?ctx.hide--:0) ; return ''};

export const closeHandlers={
    'cb:div': (el,ctx)=>{ctx.div--},
    'cb:tt':(el,ctx)=>unhide(ctx),
    'cb:mulu':(el,ctx)=>{
        if (ctx.mulu && ctx.started) {
            ctx.mulu=false;
            return '"]';
        }
    },
    note:(el,ctx)=>unhide(ctx),
    lem:(el,ctx)=>unhide(ctx),
    // l:(el,ctx)=>{ 
    //     if (ctx.snippet.substr(ctx.snippet.length-1)=='。') {
    //         ctx.compact=true;
    //         return '^r';    
    //     }
    // },
}
const getPali=pi=>{
    if (pi.indexOf(' ')==-1 ) {//removing tailing .
        if (pi[pi.length-1]=='.')pi=pi.substr(0,pi.length-1);
    } else if (pi[0]!=='"'){
        pi='"'+pi+'"';
    }
    return pi;
}
const pb=(el,ctx)=>{
    ctx.lbcount=0;
    ctx.compact=true;
    let vol='';
    
    if (el.attrs.n==='0001a') {
        vol='^v'+parseInt(el.attrs['xml:id'].substr(1,2));
    }
    const pn=el.attrs.n.replace(/^0+/,'');
    let out=vol+'^p'+ pn;
    return out;
}
const g=(el,ctx)=>{
    if (ctx.hide)return;
    const uni=ctx.charmap[ el.attrs.ref.substr(1)];
    if (uni) return uni;
    else {
        ctx.compact=true;
        return '^mc'+el.attrs.ref.substr(3); //remove #CB
    }
}
const lb=(el,ctx)=>{
    ctx.lbcount++;
    if (ctx.lbcount>1) {
        ctx.compact=true;
        return ''  //^r';
    }
}
const byline=(el,ctx)=>{
    let s='\n';
    const type=el.attrs['cb:type'];
    if (type) {
        ctx.compact=true;
        s+='^h[o='+type.toLowerCase()+']';
    }
    return s;
}
const cbtt=(el,ctx)=>{
    let s='';
    const lang=el.children.length>1&&el.children[1].attrs&&el.children[1].attrs['xml:lang'];
    if (el.children[0].name==='cb:t' && el.children[1].name==='cb:t') {
        if (lang=='pi') {
            let pi=getPali(el.children[1].innerText(true)); //take only one level
            s='^w['+lang+'='+pi+' '+ el.children[0].innerText(true)+']';
        } else {
            s=el.children[0].innerText(true);
        }
    }
    ctx.hide++;
    return s;
}
export const handlers={
    pb,g,lb,byline,'cb:tt':cbtt,
    milestone:(el,ctx)=>ctx.started=true,//skip the redundant mulu before milestone, see T30n1579_037
    note:(el,ctx)=>{  ctx.hide++},
    lg:(el,ctx)=>{ctx.compact=true; return '\n^lg'},
    lem:(el,ctx)=>{ ctx.hide+=1},//just keep the rdg

    p: (el,ctx)=>'\n',
    'cb:mulu':(el,ctx)=>{
        if (!ctx.started)return;
        if (el.attrs.level) {// T01 0001b08 , skip cb:mulu without level 
            ctx.mulu=true;
            return '^mu'+el.attrs.level+'[t="';
        }        
    },
    'cb:div': (el,ctx)=>{
        ctx.div++;
        ctx.compact=true;
        return '\n^h[o='+el.attrs.type+']';
    },
    // deal with app inside cb:tt <app n="0002008">  t01n0001_001
    /*
    app:(el,ctx)=>{
        ctx.hide++;
        let s='';
        if (el.children[0].name==='lem' && el.children[1].name==='rdg') {
            let lem=el.children[0].innerText(true);
            let rdg=el.children[1].innerText(true);
            s='^ap[o='+lem+(rdg?' '+rdg:'') +']';
        }
        return s;
    }
    */
}

import Label from '../htll/label.js';
import LabelPage from '../htll/label-page.js';
import LabelVol from '../htll/label-vol.js';
import LabelLinePos from '../htll/label-linepos.js';
import LabelKeyword from '../htll/label-keyword.js';
import LabelMulu from '../htll/label-mulu.js';
import TypeDef from './typedef.js';
export class CBetaTypeDef extends TypeDef {
    constructor(opts) {
        super(opts);
        this.defs.v=new LabelVol('v',{resets:['p'], ...opts} ); //reset page number
        this.defs.c=new LabelLinePos('c',{sequencial:true,resets:['mu'],...opts});//nameless (juan)
        this.defs.p=new LabelPage('p',{cols:3,...opts}); //page number
        this.defs.mu=new LabelMulu('mu',{trimlocal:true,opts}); //mulu, remove local
        this.defs.mc=new Label('mc',opts); //missing characters
        this.defs.h=new Label('h',opts); //general header
        this.defs.w=new Label('w',opts); //pali words
        this.defs.lg=new Label('lg',opts); //gathas

        this.defs.pr=new LabelKeyword('pr',{caption:'人名',master:this.defs.bk,...opts});
        this.defs.er=new LabelKeyword('er',{caption:'年代',master:this.defs.bk,...opts}); 
        //dy comes first as finalize from backward
    }
}
// export default {handlers,closeHandlers,'TypeDef':CBetaTypeDef}