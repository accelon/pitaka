export const packJSONString=str=>{
    return str.replace(/"([A-Za-z\d]+)":/g,'$1:')
    .replace(/:"([^\[\]\{\},: \"\'\\]+)"/g,':$1') //value has no control char
    .replace(/"/g,"'");
}

export const unpackJSONString=str=>{
    return str.replace(/\'/g,'\"')
        .replace(/([A-Za-z\d_]+):/g,'"$1":')            //key without double quote
        .replace(/:([^\[\]\{\},: \"\'\\]+)/g,':"$1"');
}

export default {packJSONString,unpackJSONString}