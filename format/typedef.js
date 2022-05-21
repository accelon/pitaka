
import LabelTypes from '../htll/labeltypes.js';
import DefTypes from "../htll/deftypes.js";
/*
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
*/
const TypeDef =(json,opts)=>{
    const out={};
    let options=opts,_opts=null;
    for (let name in json) {
        let typedef=json[name];
        if (Array.isArray(typedef)) {
        	throw 'obsolete format, use {"type":"LabelType" } instead'
        }

		if (typedef instanceof Object  ) {
			const tname=typedef.type || DefTypes[name]|| 'Label';
			options={...opts,...typedef}
			const cls=LabelTypes[tname];
			if (!cls) {
				throw "class not found "+tname;
			}
			const obj=new LabelTypes[tname](name,options);
			for (let attr in options) {
	            if (typeof obj[attr]==='undefined') obj[attr]=options[attr];
	        }
			out[name]=obj;
		} else if (typeof typedef=='string') {
	        if (!LabelTypes[typedef]) {
	            throw "label type not found "+typedef;
	        } else {
	            const obj=new LabelTypes[typedef](name,options);
	            //auto assign attribute to obj
	            for (let attr in options) {
	                if (typeof obj[attr]==='undefined') obj[attr]=options[attr];
	            }
	            out[name]=obj;
	        }
	    } else {
	    	console.log('name',name,'typedef',json[name]);
	    	throw "invalid typedef"
	    }
    }	
    return out;
}
export default TypeDef;