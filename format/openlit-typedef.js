import LabelChapter from '../htll/label-chapter.js';
import LabelBook from '../htll/label-book.js';

const TypeDef=function(opts){
    return {
        'bk': new LabelBook('bk',opts),
        'c': new LabelChapter('c',opts),
    }
};

export default TypeDef;