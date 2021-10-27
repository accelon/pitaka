import LabelDictEntry from '../htll/label-dict-entry.js';
import Label from '../htll/label.js';
import LabelSeeAlso from '../htll/label-seealso.js';
import LabelKeynumber from '../htll/label-keynumber.js';
import LabelYear from '../htll/label-year.js';
import LabelYearSpan from '../htll/label-yearspan.js';
import TypeDef from './typedef.js';
//combine external quote

class FoCiDianTypeDef extends TypeDef{
    constructor(opts){
        super(opts);
        delete this.defs.bk;
        delete this.defs.c;

        this.defs.e  =new LabelDictEntry('e',{opts});
        this.defs.li  =new Label('li',opts);
        this.defs.sk =new Label('sk',opts);
        this.defs.pli  =new Label('pli',opts);
        this.defs.tbt  =new Label('tbt',opts);
        this.defs.cf  =new Label('cf',opts); //confer
        this.defs.cb =new Label('cb',opts); //confer cbeta
        this.defs.cs =new Label('cs',opts); //pali
        this.defs.pg =new LabelKeynumber('pg',{cols:3,...opts}); //confer cbeta

        this.defs.vol  =new Label('p',opts);
        this.defs.h  =new Label('h',opts);
        this.defs.ed  =new Label('ed',opts);
        this.defs.ad  =new LabelYear('ad',{caption:"公元",...opts});
        this.defs.bc  =new LabelYear('bc',{type:'bc',caption:"公元前",...opts});
        this.defs.pr  =new LabelYearSpan('pr',{caption:"生卒",...opts});
        this.defs.year  =new LabelYearSpan('year',{caption:"年間",...opts});
        this.defs.se  =new LabelSeeAlso('se',opts);

       this.defs.top  =new Label('top',opts);//to be remove
       this.defs.pua  =new Label('pua',opts);//to be remove
       this.defs.yu  =new Label('yu',opts);//外語
    }
};

export default {'TypeDef':FoCiDianTypeDef,tree:'e'};