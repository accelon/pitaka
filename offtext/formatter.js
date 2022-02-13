import {parseOfftextHeadings} from './parser.js';

class Formatter_OffText {
    constructor (context,log,config){
        this.context=context;
        this.log=log;
        this.config=config;
    }
    scan(raw,locator){
        //rawtext will be saved to js
        const {writertext,text,tags,headings}=parseOfftextHeadings(raw,this.context.ptkline,locator);
        return {text,tags,writertext,headings};    
    }
}
export default Formatter_OffText;