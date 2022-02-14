
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
        if (!LabelTypes[typename]) {
            throw "label type not found "+typename;
        } else {
            const obj=new LabelTypes[typename](name,options);
            //auto assign attribute to obj
            for (let attr in options) {
                if (typeof obj[attr]==='undefined') obj[attr]=options[attr];
            }
            out[name]=obj;
        }
    }
    return out;
}
export default TypeDef;