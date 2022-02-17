
import {PATHSEP,DELTASEP} from '../platform/constants.js'

export const posBackwardPin=(linetext,x)=>{
    if (x<1) return '';

    let len=2,occur=0; //start from 2 char for better looking of foot note
    let at=linetext.indexOf(linetext.substr(x-len,len));

    while (at!==x-len && x) {
        if (len>5) break;
        len++;
        at=linetext.indexOf(linetext.substr(x-len,len));
    }

    if (at!==x-len && linetext.charCodeAt(x)>0xff) len=2;

    while (at!==x-len && at>-1) {
        occur++;
        at=linetext.indexOf(linetext.substr(x-len,len),at+1);
    }
    return (at===x-len)?(occur?occur:'')+DELTASEP+linetext.substr(x-len,len):null;
}
export const pinPos=(linetext,x,backward=false)=>{
    let pin='';
    if (backward) {
        pin=posBackwardPin(linetext,x)
    }
    if (pin) return pin;

    let len=1,occur=0;
    let at=linetext.indexOf(linetext.substr(x,len));
    while (at!==x && x+len<linetext.length) {
        if (len>5) break;
        len++;
        at=linetext.indexOf(linetext.substr(x,len));
    }

    if (at!==x && linetext.charCodeAt(x)>0xff) len=2;//shorter pin for non-ascii

    while (at!==x && at>-1) {
        occur++;
        at=linetext.indexOf(linetext.substr(x,len),at+1);
    }
    return (at===x)?linetext.substr(x,len)+(occur?DELTASEP+occur:''):null;
}

export const posPin=(linetext,pin)=>{
    if (typeof pin==='number') {
        if (pin<0 || pin>linetext.length) {
            console.error('error pin',pin,linetext);
            return 0;
        }
        return pin;
    }

    if (pin[0]===DELTASEP) {
        return linetext.indexOf(pin.substr(1));
    }

    const m=pin.match(/:(\d+)$/);
    const mb=pin.match(/^(\d+):/);

    let occur=0,backward=0;

    if (mb) {
        occur=parseInt(mb[1]);
        pin=pin.substr(DELTASEP.length+mb[1].length);
        backward=pin.length;
    } else if (m) {
        occur=parseInt(pin.substr( pin.length-m[1].length ));
        pin=pin.substr(0,pin.length-m[1].length-1);
    }

    let at=linetext.indexOf(pin);
    while (occur) {
        at=linetext.indexOf(pin,at+1)
        occur--;
    }
    if (at==-1) return -1;//console.error("cannot pospin",pin,linetext);
    return at+backward;
}
//hook 文鉤 : 以一或兩字表達引文的起訖，不能跨段。
export const makeHook=(linetext,x,w)=>{
    if (w<0)return '';
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
        if (at==x) {
            lead=lead.substr(0,1);//one char is enough
            if (!end) end=linetext.substr(x+w-1,1);
        }
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

export default {parseHook,makeHook,pinPos,posPin }