
import {PATHSEP,INCSEP} from '../platform/constants.js'

//hook 文鉤 : 以一或兩字表達引文的起訖，不能跨段。
export const makeHook=(linetext,x,w)=>{
    let lead=linetext.substr(x,2);
    let end='';
    let occur=0; //0-base occurance
    let eoccur=0; //0-base occurance

    if (w>2) {
        end=linetext.substr(x+w-2,2);
    }

    let at=linetext.indexOf(lead);
    while (at>-1 && at<x) {
        at=linetext.indexOf(lead,at+1);
        occur++;
    }

    if (occur==0) {
        at=linetext.indexOf(lead.substr(0,1));
        if (at==x) lead=lead.substr(0,1);//one char is enough
    }

    let hook=lead+(occur?INCSEP+occur:'');

    if (end) {
        let at=linetext.indexOf(end,x);
        while (at>-1 && at<x) {
            at=linetext.indexOf(end,at+1);
            eoccur++;
        }
        if (at>-1) {
            if (eoccur==0&&linetext.indexOf(end.substr(1),x)==at+1) end=end.substr(1);
            hook+=PATHSEP+end+(eoccur?INCSEP+eoccur:'');
        } else {
            end='';
        }
    }

    return hook;
}

export const parseHook=(str,linetext)=>{
    if (!str.trim())return null;

    const [L,E]=str.split(',');
    let [lead,leadn]=(L||'').split(/:(\d+)/);
    let [end,endn]=(E||'').split(/:(\d+)/);

    leadn=parseInt(leadn)||0;
    endn=parseInt(endn)||0;
    
    let x=0;
    x=linetext.indexOf(lead);
    let n=leadn;
    while (n) {
        x=linetext.indexOf(lead,x+1);
        n--;
    }

    let x2=linetext.indexOf(end,x);
    n=endn;
    while (n) {
        x2=linetext.indexOf(lead,x2+1);
        n--;
    }

    return {x,w:x2-x+end.length,lead,leadn,end,endn}
}