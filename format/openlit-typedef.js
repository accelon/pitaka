import LabelChapter from '../htll/label-chapter.js';
import LabelBook from '../htll/label-book.js';
import Label from '../htll/label.js';

const TypeDef=function(opts){
    return {
        'bk': new LabelBook('bk',Object.assign({resets:['c']},opts)),
        'c': new LabelChapter('c',opts),
        'mc': new Label('mc',opts), //missing characters
    }
};

export default TypeDef;