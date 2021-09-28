import {parseOfftext} from './offtext-parser.js';

class Formatter_OffText {
    constructor (context){
        this.context=context;
    }
    scan(content){
        const {text,tags}=parse(content);
        // console.log(tags)
        return {text,tags};    
    }
}
export default Formatter_OffText;