export const fromChineseNumber=str=>{
    return parseInt(str.replace(/一/g,'1')
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
    .replace(/十/g,'')
    .replace(/[○零]/g,'0'));
}