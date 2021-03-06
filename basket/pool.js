let _pool={};
//if (typeof chrome!=='undefined' && 'runtime' in chrome) {
//    chrome.runtime.sendMessage("pool",res=>_pool=res.pool);
// }

const has=name=>!!_pool[name];
const get=name=>_pool[name];
const add=(name,inst)=>_pool[name]=inst;
const getAll=()=>{
    const out=[];
    for (let name in _pool) {
        out.push(_pool[name]);
    }
    return out;
}
const hasLang=lang=>{
    for (let name in _pool) {
        const ptk=_pool[name];
        if (ptk.header.lang===lang)return true;
    }
}
export default {has,get,add,getAll,hasLang};