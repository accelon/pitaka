import {parseAddress} from './address.js'
import {scanLine,scanTag,convertLine} from './tagtext.js'
import Label from './label.js'
import LabelVol from './label-vol.js'
import LabelPage from './label-page.js'
import LabelBook from './label-book.js'
import LabelChapter from './label-chapter.js'
import LabelMulu from './label-mulu.js'
import LabelLinePos from './label-linepos.js'
import LabelKeyword from './label-keyword.js'
import LabelKeynumber from './label-keynumber.js'
import LabelYear from './label-year.js'
import LabelYearSpan from './label-yearspan.js'
import LabelSeeAlso from './label-seealso.js'

import LabelHeader from './label-header.js'
import LabelDictEntry from './label-dict-entry.js'

import LabelSection from './label-section.js'
import LabelAnchor from './label-anchor.js'

import LabelTransclusion from './label-transclusion.js'
const LabelType={Label,LabelHeader,LabelDictEntry,LabelVol,LabelPage,LabelLinePos
    ,LabelKeyword,LabelKeynumber,LabelYear,LabelYearSpan,LabelSeeAlso,
    LabelBook,LabelChapter,LabelMulu,LabelSection,LabelAnchor,LabelTransclusion}

export {parseAddress,LabelType,scanLine,scanTag,convertLine}