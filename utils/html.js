export const escapeHTML=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export const entity2unicode=s=>{
    s=s.replace(/&#x([\dABCDEF]+);/g,(m,m1)=>{
        return String.fromCodePoint( parseInt(m1,16));
    }).replace(/&#(\d+);/g,(m,m1)=>{
        return String.fromCodePoint( parseInt(m1,10));
    }).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
    return s;
}
