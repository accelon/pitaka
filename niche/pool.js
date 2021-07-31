const _pool={};
const has=name=>!!_pool[name];
const get=name=>_pool[name];
const add=(name,inst)=>_pool[name]=inst;
export default {has,get,add};