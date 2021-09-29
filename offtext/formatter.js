import {parseOfftext} from './parser.js';

class Formatter_OffText {
    constructor (context){
        this.context=context;
    }
    scan(content){
        const {text,tags}=parseOfftext(content,this.context.ptkline);
        return {text,tags};    
    }
}
export default Formatter_OffText;