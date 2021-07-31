import {compareKey,parseKey,NestedOrderedList,NestedOrderedListBuilder}  from './nested-ordered-list.js' 

let pass=0,test=0;

const test_parseKey=()=>{
    let pass=0,test=0;
    let nums=parseKey('1.1.4');
    pass+= nums.join('/')=='1/1/4';test++

    nums=parseKey('1.0.0');
    pass+= nums.join('/')=='1';test++

    nums=parseKey('...2.0...');
    pass+= nums.join('/')=='2';test++

    nums=parseKey('0.2.0');
    pass+= nums.join('/')=='0/2';test++

    nums=parseKey('1.0.1');
    pass+= nums.join('/')=='1/0/1';test++

    return pass==test
}
const test_compareKey=()=>{
    let pass=0,test=0;    
    pass+=compareKey([1,1,1],[1,1,1])==0; test++
    pass+=compareKey([1],[1,1,1])==-1; test++
    pass+=compareKey([1,1,2],[1,1,1])>0; test++
    pass+=compareKey([1,2],[1,1,1])>0; test++
    pass+=compareKey([2],[1,200])>0; test++
    pass+=compareKey([1],[1,0,0])==0; test++
    return test==pass;
}
const print_interal=nol=>{
    console.log(nol._getKeys(),nol._getValues())
}
const test_level1_seq=()=>{
    const nol=new NestedOrderedListBuilder();
    let pass=0,test=0;
    pass+=nol.add('1','v0');test++;
    pass+=nol.add('2','v1');test++;
    pass+=nol.add('3','v2');test++;
    // print_interal(nol)
    return test==pass;
}

const test_level1_repeat=()=>{
    const nol=new NestedOrderedListBuilder();
    let pass=0,test=0;
    pass+=nol.add('1','v0');test++;
    pass+=nol.add('1','v1');test++; //failed repeated
    // print_interal()
    return test==pass+1;
}
const test_level1_gap=()=>{
    const nol=new NestedOrderedListBuilder();
    let pass=0,test=0;
    pass+=nol.add('1','v0');test++;
    pass+=nol.add('3','v1');test++; //failed gap
    // print_interal(nol)
    return test==pass+1;
}
const test_nested=()=>{
    let pass=0,test=0; const nol=new NestedOrderedListBuilder();
   
    pass+=nol.add('1','v0');test++;
    pass+=nol.add('1.0.1','v1');test++;
    pass+=nol.add('1.0.2','v2');test++;
    pass+=nol.add('1.1','v3');test++;
    pass+=nol.add('1.1.1','v5');test++;
    pass+=nol.add('1.1.2','v6');test++;
    pass+=nol.add('1.2','v4');test++;
    // print_interal(nol)
    // const list=nol.list();
    return test==pass;
}
const gen_huge=()=>{
    const nol=new NestedOrderedListBuilder();
    const now = performance.now();
    let count=0;
    for (let i=1;i<2;i++) {
        // nol.add( [i],'v'+i)
        for (let j=0;j<3;j++) {
            // nol.add( [i,j],'v'+i+'/'+j)
            for (let k=0;k<4;k++) {
                nol.add([i,j,k], 'v'+count );
                count++;
            }
        }
    }
    // console.log(nol.list())
    // console.log( (performance.now()-now).toFixed(3),'us');
    // console.log(nol._getKeys())
    return nol;
}

const test_add_in_order=()=>{
    let pass=0,test=0; const nol=new NestedOrderedListBuilder({addInOrder:false});
    pass+=nol.add('1','v1');test++;
    pass+=nol.add('1.1','v2');test++;
    pass+=nol.add('1.2','v3');test++;
    pass+=nol.add('1.1.1','v4');test++; //should fail
    return test-1==pass
}

const test_pack_keys=()=>{
    let pass=0,test=0;    
    const rnol=gen_huge();
    const keys=rnol.packKeys();
    const values=rnol.packValues();
    const nol=new NestedOrderedList({values , keys});
    // console.log(keys)
    // console.log(rnol.list())
    // console.log(rnol._getKeys())
    // console.log(nol._getKeys())
    // console.log(nol.list())
    pass+= rnol.list().join('\n')==nol.list().join('\n');test++;
    return pass==test
}
const gen_readonly=()=>{
    const rnol=gen_huge();
    const keys=rnol.packKeys();
    const values=rnol.packValues();
    const nol=new NestedOrderedList({values , keys});
    return nol;
}
const test_access_value=()=>{
    let pass=0,test=0;    
    const rnol=gen_huge();
    const keys=rnol.packKeys();
    const values=rnol.packValues();
    const nol=new NestedOrderedList({values , keys});
    const rawvalues=rnol._getValues();
    // console.log(keys)
    // console.log(nol._getKeys())
    const keyvalues=rnol.list().map( (i,idx)=>[i,rawvalues[idx]]);

    keyvalues.forEach( ([key,value],idx) =>{
        pass+=nol.getValue(key)==value; test++;
    })
    return pass==test;
}
const test_has_children=()=>{
    let pass=0,test=0;    
    const nol=gen_readonly();
    pass+=nol.hasChild('1');test++;
    pass+=nol.hasChild('1.1');test++;
    pass+=!nol.hasChild('1.1.1');test++;
    pass+=nol.hasChild('1.2');test++;
    return pass==test;
}
const test_siblingCount=()=>{ 
    let pass=0,test=0;    
    const nol=gen_readonly();
    pass+=nol.siblingCount('1')==1;test++;
    pass+=nol.siblingCount('1.2')==3;test++;
    pass+=nol.siblingCount('1.1.3')==4;test++;
    return pass==test;
}
console.clear();
// pass +=  test_parseKey(); test++;
// pass +=  test_compareKey() ; test++;

// pass +=  test_level1_seq() ; test++;
// pass +=  test_level1_repeat() ; test++;
// pass +=  test_level1_gap() ; test++;
// pass +=  test_nested() ; test++;

// pass +=  test_add_in_order() ; test++;
// pass +=  test_pack_keys() ; test++;
// pass +=  test_access_value() ; test++;
// pass +=  test_has_children() ; test++;
pass +=  test_siblingCount() ; test++;

console.log(`pass ${pass}/${test}`);