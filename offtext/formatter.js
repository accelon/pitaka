import {parseOfftext} from './parser.js';

class Formatter_OffText {
    constructor (context){
        this.context=context;
    }
    scan(rawlines){
        const {text,tags}=parseOfftext(rawlines,this.context.ptkline);
        return {text,tags,rawlines};    
    }
}
export default Formatter_OffText;