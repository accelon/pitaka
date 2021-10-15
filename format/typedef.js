import LabelChapter from '../htll/label-chapter.js';
import LabelBook from '../htll/label-book.js';

class TypeDef {
    constructor(opts){
        this.defs={
            bk:new LabelBook('bk',Object.assign({resets:['c']},opts)),
            c:new LabelChapter('c',opts)
        };
    }
};

export default TypeDef;