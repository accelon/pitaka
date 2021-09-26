import {readFileSync,writeFileSync} from 'fs'
import {Promise} from 'node-fetch'
const catalog=readFileSync('./catalog.csv','utf8').split(/\r?\n/);
const max=10;

const genurl=(prefix,id)=>{
    'http://haodoo.net/?M=d&P='+prefix+id+'.updb';
}

const prefixes=['G','D','B','C'];
//try single volumn
for (let i=0;i<max;i++){
    const entry=catalog[i];
    const [id]=entry.split(',');
    console.log('trying',id);
    for (let j=0;j<prefixes.length;j++) {
        const url=genurl(prefixes[j],id);
        const rep=await Promise.fetch(url,{method:'HEAD'});
        if (rep.ok) {
            content_length=rep.headers.get('Content-Length');
            console.log(url,content_length);
            break;
        }
    }
}
