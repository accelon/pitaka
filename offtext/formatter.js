import {parseOfftext} from './parser.js';

class Formatter_OffText {
    constructor (context){
        this.context=context;
    }
    scan(rawtext){
        const {text,tags}=parseOfftext(rawtext,this.context.ptkline);
        return {text,tags,rawtext};    
    }
}
export default Formatter_OffText;