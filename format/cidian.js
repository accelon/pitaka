import LabelDictEntry from '../htll/label-dict-entry.js';
import Label from '../htll/label.js';
import LabelSeeAlso from '../htll/label-seealso.js';
import LabelTransclusion from '../htll/label-transclusion.js';
import TypeDef from './typedef.js';
//combine external quote

class CidianTypeDef extends TypeDef{
    constructor(opts){
        super(opts);
        delete this.defs.bk;
        delete this.defs.c;

        this.defs.e  =new LabelDictEntry('e',{resets:['y'],...opts});
        this.defs.y  =new Label('y',{resets:['d','eg','q'],...opts});
        this.defs.d  =new Label('e',opts);
        this.defs.eg =new Label('eg',opts);
        this.defs.q  =new Label('q',opts);
        this.defs.t  =new LabelTransclusion('t',opts);
        this.defs.se=new Label('se',opts);
        this.defs.en =new Label('en',opts);
    }
};

export default {'TypeDef':CidianTypeDef,tree:'e'};