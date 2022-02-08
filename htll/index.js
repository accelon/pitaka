import {parseAnchor} from './address.js'
import {scanLine,scanTag,convertLine} from './tagtext.js'
import  LabelTypedefs from './labeltypes.js'

const labelByType=(labeltype,labels)=>{
    for (let i in labels) {
        if (labels[i].constructor.name===labeltype) return labels[i];
    }
}
export {parseAnchor,LabelTypedefs,scanLine,scanTag,convertLine,labelByType}