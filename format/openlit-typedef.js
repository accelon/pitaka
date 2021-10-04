import LabelParagraph from '../htll/label-p.js';
import LabelChapter from '../htll/label-chapter.js';
import LabelBook from '../htll/label-book.js';

const TypeDef=function(opts){
    return {
        'bk': new LabelBook('bk',opts),
        // 'p': new LabelParagraph('p',opts),
        'c': new LabelChapter('c',opts),
    }
};

export default TypeDef;