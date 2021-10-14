export const headerWithNumber = [
    /第([一二三四五六七八九十百○零]+)[回章卷品節]/,
    /卷([一二三四五六七八九十百○零]+)/,
]

export const fromChineseNumber=str=>{
    return parseInt(str
    .replace(/百([二三四五六七八九])十/,'$1十')
    .replace(/百十$/,'10')
    .replace(/百十/,'1')
    .replace(/百$/,'00')
    .replace(/百/,'0')
    .replace(/一/g,'1')
    .replace(/二/g,'2')
    .replace(/三/g,'3')
    .replace(/四/g,'4')
    .replace(/五/g,'5')
    .replace(/六/g,'6')
    .replace(/七/g,'7')
    .replace(/八/g,'8')
    .replace(/九/g,'9')
    .replace(/^十$/,'10')
    .replace(/^十/,'1')
    .replace(/十$/,'0')
    .replace(/十/,'')
    .replace(/[○零]/g,'0'));
}

export const extractChineseNumber=(str,firstnum=false)=>{
    let cn='';
    for (let i=0;i<headerWithNumber.length;i++) {
        const pat=headerWithNumber[i];
        const m=str.match(pat);
        if (m) cn=fromChineseNumber(m[1]);
    }
    if (!cn) {
        const m=str.match(/^([一二三四五六七八九十○百零]+)$/);
        if (m) cn=fromChineseNumber(m[1]);
    }
    return cn;
}
