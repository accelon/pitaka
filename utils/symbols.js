const Superscript={'1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

export const toSuperscript=str=>{
    return Superscript[str.trim()]||str;
}