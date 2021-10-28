
import LabelTypes from '../htll/labeltypes.js';
const TypeDef =(json,opts)=>{
    const out={};
    let options=opts,_opts=null;
    for (let name in json) {
        let typename=json[name];
        if (Array.isArray(json[name])) {
            [typename,_opts]=json[name];
            options={...opts,..._opts}
        }

        out[name]=new LabelTypes[typename](options);
    }
    return out;
}
export default TypeDef;