// export const ALLOW_EMPTY = {pts:true,pdf:true,yu:true,pb:true,en:true,cs:true,cb:true,fn:true,note:true,blnk:true,embed:true,pr:true,t:true,p:true,unote:true};
export const ALWAYS_EMPTY = {br:true,r:true};
export const AUTO_TILL_END={e:true}
export const OFFTAG_REGEX_G=/\^([a-z_]+[#@\/\.\:~a-z_\-\d]* ?)(\[(?:\\.|.)*?\])?/g //標記樣式
export const OFFTAG_REGEX=/\^([a-z_]+[#@\/\.\:~a-z_\-\d]* ?)(\[(?:\\.|.)*?\])?/ //標記樣式
export const OFFTAG_NAME_ATTR=/([a-z_\-\:]+)(.*)/  //名稱可以含-az_: ，但不可為數字
export const OFFTAG_ATTRS="(\\[(?:\\\\.|.)*?\\])?"
export const OFFTAG_ID=/^([a-z\d\-]+)/;
export const QSTRING_REGEX_G= /"((?:\\.|.)*?)"/g                                  //字串標式
export const OFFTAG_LEADBYTE='^';

export const NAMED_OFFTAG="([#@\\/\\.\\:~a-z_\\-\\d]* ?)(\\[(?:\\\\.|.)*?\\])?" //已知名稱的標記

export const QUOTEPREFIX='\u001a', QUOTEPAT=/\u001a(\d+)/g ;                // 抽取字串的前綴，之後是序號
export function OffTag(name,attrs,y,x,w,offset) {
    return { name,attrs,y,x,w,offset};
}