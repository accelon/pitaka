import Label from './label.js'
import LabelVol from './vol.js'
import LabelPage from './page.js'
import LabelBook from './book.js'
import LabelChapter from './chapter.js'
import LabelChunk from './chunk.js'
import LabelMulu from './mulu.js'
import LabelMilestone from './milestone.js'
import LabelKeyword from './keyword.js'
import LabelKeynumber from './keynumber.js'
import LabelYear from './year.js'
import LabelYearSpan from './yearspan.js'
import LabelSeeAlso from './seealso.js'

import LabelHeader from './header.js'
import LabelEntry from './entry.js'

import LabelSection from './section.js'
import LabelAnchor from './anchor.js'

import LabelTransclusion from './transclusion.js'
import LabelLink from './link.js'
import LabelLang from './lang.js'
import LabelFootnote from './footnote.js'

const LabelTypes = {Label,LabelHeader,LabelEntry,LabelVol,LabelPage,LabelMilestone
    ,LabelKeyword,LabelKeynumber,LabelYear,LabelYearSpan,LabelSeeAlso,LabelLang,LabelFootnote,
LabelBook,LabelChapter,LabelChunk,LabelMulu,LabelSection,LabelAnchor,LabelTransclusion,LabelLink}

export default LabelTypes;