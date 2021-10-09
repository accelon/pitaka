
import {PATHSEP,DELTASEP} from '../platform/constants.js'

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

    let hook=lead+(occur?DELTASEP+occur:'');

    if (end) {
        let at=linetext.indexOf(end,x);
        while (at>-1 && at<x) {
            at=linetext.indexOf(end,at+1);
            eoccur++;
        }
        if (at>-1) {
            if (eoccur==0&&linetext.indexOf(end.substr(1),x)==at+1) end=end.substr(1);
            hook+=PATHSEP+end+(eoccur?DELTASEP+eoccur:'');
        } else {
            end='';
        }
    }

    return hook;
}

export const parseHook=(str_arr,linetext,y=0)=>{
    if (!str_arr)return null;

    const [L,E]=Array.isArray(str_arr)?str_arr:str_arr.split(PATHSEP);
    let [s,nos]=(L||'').split(DELTASEP);
    let [e,noe]=(E||'').split(DELTASEP);

    nos=parseInt(nos)||0;
    noe=parseInt(noe)||0;
    
    let x=0;
    x=linetext.indexOf(s);
    let n=nos;
    while (n) {
        x=linetext.indexOf(s,x+1);
        n--;
    }

    let x2=linetext.indexOf(e,x);
    n=noe;
    while (n) {
        x2=linetext.indexOf(s,x2+1);
        n--;
    }

    return {y,x,w:x2-x+e.length,s,nos,e,noe}
}