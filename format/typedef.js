
import LabelTypes from '../htll/labeltypes.js';
import DefTypes from "../htll/deftypes.js";

const setupLabelDefs=defs=>{
	const out={};
	for (let nm in defs) {
		const obj=defs[nm];
		if (obj instanceof Object) {
			const typename=DefTypes[nm]||'Label';
			out[nm]=[ typename, obj ];
		} else {
			if (typeof obj==='string') {
				out[nm]=[obj];
			} else {
				out[nm]=obj;
			}
		}
	}
	return out;
}

const TypeDef =(json,opts)=>{
    const out={};
    let options=opts,_opts=null;
    for (let name in json) {
        let typename=json[name];
		if (typename instanceof Object && !Array.isArray(json[name]) ) {
			const tname=DefTypes[name]||'Label';
			options={...opts,...typename}
			const obj=new LabelTypes[tname](name,options);
			for (let attr in options) {
	            if (typeof obj[attr]==='undefined') obj[attr]=options[attr];
	        }
			out[name]=obj;
		} else {
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
    }	
    return out;
}
export default TypeDef;