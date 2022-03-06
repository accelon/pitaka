/*
const builtin_typedef={
    'bk':['LabelBook',{}],
    'c':'LabelChapter',
    'r':['LabelChapter',{reset:"bk"}], //new name reading
    'n':['LabelMilestone',{sequencial:true,range:true,reset:"bk"}],
    'b':'Label',
    'lang':'LabelLang',    
    'kai':'Label',
    'u':'Label',
    'i':'Label',
    'h':'Label',
    'mu':'LabelMulu',
    't':'LabelTransclusion',
    'k':'LabelLink',
    "f":["Label", {"caption":"注"}],
    "fn":["LabelFootnote", {"caption":"注釋"}],
    //general versioning
    'cut':'Label','paste':'Label','del':'Label','add':'Label','edit':'Label','corr':'Label'
}
*/
import cs from './cs.js'
import simple from './simple.js'
export default {cs,simple};
