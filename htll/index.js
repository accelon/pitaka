import {parseAddress} from './address.js'
import {scanLine,scanTag,convertLine} from './tagtext.js'
import Label from './label.js'
import LabelVol from './label-vol.js'
import LabelPage from './label-page.js'
import LabelBook from './label-book.js'
import LabelChapter from './label-chapter.js'

import LabelHeader from './label-header.js'
import LabelDictEntry from './label-dict-entry.js'

import LabelSection from './label-section.js'
import LabelAnchor from './label-anchor.js'

import LabelTransclusion from './label-transclusion.js'
const LabelType={Label,LabelHeader,LabelDictEntry,LabelVol,LabelPage,
    LabelBook,LabelChapter,LabelSection,LabelAnchor,LabelTransclusion}

export {parseAddress,LabelType,scanLine,scanTag,convertLine}