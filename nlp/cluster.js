import {bsearch} from '../utils/bsearch.js'
const clusterFromLinks=(links,tokentable=[])=>{
    const backwards={};
    const groups=[];

    const addToGroup=(s1,s2)=>{
        const contains=[];
        for (let i=0;i<groups.length;i++) {
            let found=0;
            if (groups[i][s1]) {
                if (!groups[i][s2]) groups[i][s2]=0;
                found++;
            } else if (groups[i][s2]) {
                if (!groups[i][s1]) groups[i][s1]=0;
                found++;
            } 
            if (found) {
                if (found===1) groups[i][s1]++;
                if (found===1) groups[i][s2]++;
                contains.push(i);
            }
        }
        if (contains.length==0) groups.push({[s1]:1,[s2]:1}); //new pair
        else if (contains.length==2) { //combine two groups
            const first=groups[contains[0]];
            const second=groups[contains[1]];
            for (let item in second) {
                if (!first[item]) first[item]=0;
                first[item] += second[item];
            }
            groups.splice( contains[1] ,1);
        }
    }

    for (let n in links) {
        for (let i=0;i<links[n].length;i++) {
            addToGroup(n,links[n][i]);
            // if (!backwards[links[n][i]]) backwards[links[n][i]]=[];
            // backwards[links[n][i]].push(n);
        }
    }
    for (let i=0;i<groups.length;i++) {
        const arr=[];
        for (let n in groups[i]) {
            arr.push([n,groups[i][n]]);
        }
        arr.sort((a,b)=>b[1]-a[1]);
        groups[i]=arr.map(it=>it[0]);
    }
    groups.sort((a,b)=>b.length-a.length);
    fs.writeFileSync('cluster.txt',groups.join('\n'),'utf8');
    // console.log(Object.keys(backwards).length)
    // console.log(Object.keys(links).length)
    return [];
}
export {clusterFromLinks}