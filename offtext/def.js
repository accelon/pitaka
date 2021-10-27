export const ALLOW_EMPTY = {fn:true,note:true,blnk:true,embed:true,pr:true};
export const ALWAYS_EMPTY = {br:true,r:true,pb:true};
export const OFFTAG_REGEX_G=/\^([A-Za-z_]+[#\.~A-Za-z_\-\d]* ?)(\[(?:\\.|.)*?\])?/g //標記樣式
export const OFFTAG_ATTRS="(\\[(?:\\\\.|.)*?\\])?"
export const QSTRING_REGEX_G= /"((?:\\.|.)*?)"/g                                  //字串標式
export const OFFTAG_LEADBYTE='\\^';
export function OffTag(name,attrs,y,x,w) {
    return { name,attrs,y,x,w};
}