import OffTextFormatter from '../offtext/formatter.js';
import TypeDef from './typedef.js';
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

const XML2OffText = el=>{
    console.log(el)
    return 'xxxx'
}
const readFile=async f=>{
    const fn=f;
    let content='';
    if (typeof f.name==='string') fn=f.name;
    const ext=fn.match(/(\.\w+)$/)[1];
    if (ext=='.xml') {
        process.stdout.write('\r processing'+f+'    ');
        const xmlcontent=await fs.promises.readFile(f,'utf8');
        const el=XML.parse(xmlcontent);  //need ltx
        content=XML2OffText(el);
    } else {
        throw "unknown extension "+ext
    }
    return content;
}
export default {Formatter,'TypeDef':CBetaTypeDef,readFile}