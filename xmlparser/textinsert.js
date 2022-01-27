/*
    milestone.json 格式
    {"6p0040a14":101,             //直接加入段號
    //同一行多個insert 以 @1, @2 表示
     "6p0040a14@1":[102,"諸",1],  // 重覆再找1次"諸"，在該位置加上 102， 省略 第三個元素表示一找到即是
    }
*/
export const getInserts=(allmilestones,msid)=>{ //this is offtext milestone, not TEI milestone tag,
    if (!allmilestones) return null;
    const out=[];
    for (let mstag in allmilestones) {
        const milestones=allmilestones[mstag];
        let n=0; // milestone key 必須唯一，如果一個lb 中有多於一個milestone, 以@1, @2 表示
        let id=msid;
        let m=milestones[id];
        while (m) {
            out.push([mstag,m]);
            id=msid+'@'+(++n);
            m=milestones[id];
        }
    }
    if (!out.length) return null;//此lb 無milestone
    else return out; //多於一個
}
const insertAtOccur=(text,mstag,ins)=>{
    const [toinsert ,tofind]=ins;   // 要插入的數字或字串， 插入點(搜尋字串)，重覆搜尋次數
    let at=text.indexOf(tofind);
    while (at>-1&&ins[2]>0) {
        at=text.indexOf(tofind,at+tofind.length);
        ins[2]--; //因 text cl 可能被破開，ins[2]是第n個出現，找到就要減1。
    }
    return at===-1?text:text.substr(0,at)+'^'+mstag+toinsert+text.substr(at);
}

export const insertText=(text,inserts)=>{
    if (!inserts || !inserts.length) return text;
    let t=text;
    while (inserts.length) {
        const [tag,ins]=inserts.shift();  
        const newtext=insertAtOccur(t, tag,ins );
        if (newtext===text) { //not inserted, wait for next string el
            inserts.unshift([tag,ins]);
            break;
        } else {
            t=newtext;
        }
    }
    return t;
}