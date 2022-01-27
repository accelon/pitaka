// export const ALLOW_EMPTY = {pts:true,pdf:true,yu:true,pb:true,en:true,cs:true,cb:true,fn:true,note:true,blnk:true,embed:true,pr:true,t:true,p:true,unote:true};
export const ALWAYS_EMPTY = {br:true,r:true};
export const AUTO_TILL_END={bk:true, e:true}
export const OFFTAG_REGEX_G=/\^([a-z_]+[@\/\.~a-z_\-\d]* ?)(\[(?:\\.|.)*?\])?/g //標記樣式

export const OFFTAG_ATTRS="(\\[(?:\\\\.|.)*?\\])?"
export const QSTRING_REGEX_G= /"((?:\\.|.)*?)"/g                                  //字串標式
export const OFFTAG_LEADBYTE='\\^';
export function OffTag(name,attrs,y,x,w) {
    return { name,attrs,y,x,w};
}