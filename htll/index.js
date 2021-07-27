import {parse,stringify} from './address.js'
import {scanLine,scanTag,fileLines,fileContent,convertLine} from './tagtext.js'
import Label from './label.js'
import LabelPB from './label-pb.js'
import LabelHeader from './label-header.js'
import LabelDictEntry from './label-dict-entry.js'
const LabelType={LabelPB,LabelHeader,
    LabelDictEntry};
export {parse,stringify,Label,LabelType,scanLine,scanTag,convertLine,
    fileLines,fileContent}