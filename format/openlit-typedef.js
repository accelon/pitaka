import LabelParagraph from '../htll/label-p.js';
import LabelBookChapter from '../htll/label-chapter.js';
import LabelBook from '../htll/label-book.js';

const TypeDef=function(opts){
    return {
        'book': new LabelBook('book',opts),
        'p': new LabelParagraph('p',opts),
        'ch': new LabelBookChapter('ch',opts),
    }
};

export default TypeDef;