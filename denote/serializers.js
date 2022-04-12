import {OFFTAG_COMPACT_ATTR} from '../offtext/index.js'
export const XMLSerializer=den=>{
    let str='';
    for (let i=0;i<den.data.length;i++) {
        const it=den.data[i];
        const attr=it[den.akey]||{};
        str+=  (attr.open||'')+it.tk+(attr.close||'');
    }
    return str;
}
export const offtextSerializer=den=>{
    let str='';
    for (let i=0;i<den.data.length;i++) {
        const it=den.data[i];
        const attr=it[den.akey]||{};
        let space=''
        if (attr.open && attr.close) {
            space=' ';  //need to separate tag and text
        } 
        str+=  (attr.open||'')+space+it.tk+(attr.close||'');
    }
    return str;
}
export const plainSerializer=den=>{

}
export default {plain:plainSerializer,xml:XMLSerializer,offtext:offtextSerializer};