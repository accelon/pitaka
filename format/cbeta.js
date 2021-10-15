import OffTextFormatter from '../offtext/formatter.js';
import TypeDef from './typedef.js';
import {DOMFromString,JSONify,xpath} from '../xmlparser/index.js';
import {parseOfftext} from '../offtext/parser.js';
class Formatter extends OffTextFormatter {
    constructor (context){
        super(context);
    }
    scan(rawlines){
        // const {text,tags}=parseOfftext(rawlines,this.context.ptkline);
        console.log('scanning',rawlines)
        const text='',tags=[];
        return {text,tags,rawlines};    
    }
}

class CBetaTypeDef extends TypeDef {
    constructor(opts) {
        super(opts);
    }
}

const handlers={
    p: (el)=>{
        return '\n^p['+el.attrs['xml:id'].substr(6)+']'
        +el.children.map(node=>{
            if (typeof node==='string') {
                return node;
            }
            return '';
        }).join('');
    },
    lb:el=>{
        // return '^lb['+el.attrs.n+']';
    }
}



const XML2OffText = el =>{
    let out='';
    const handler= handlers[el.name];
    if (handler) out=handler(el);
    if (el.children && el.children.length) out+=el.children.map(XML2OffText).join('');
    return out;
}

const readFile=async f=>{
    const fn=f;
    let content='';
    if (typeof f.name==='string') fn=f.name;
    const ext=fn.match(/(\.\w+)$/)[1];
    if (ext=='.xml') {
        process.stdout.write('\r processing'+f+'    ');
        const xmlcontent=await fs.promises.readFile(f,'utf8');
        const el=DOMFromString(xmlcontent);  //need ltx
        const body=xpath(el,'TEI/text/body');
        content=XML2OffText(body);
        console.log(content);
    } else {
        throw "unknown extension "+ext
    }
    return content;
}
export default {Formatter,'TypeDef':CBetaTypeDef,readFile}