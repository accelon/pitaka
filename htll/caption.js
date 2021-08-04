export const getCaption=(text)=>{
    let caption=text.replace(/<.+?>/g,'');
    if (caption.length>30||caption.match(/['"\/\{\}？，。\,：；！．]/)) {
        throw "not a proper caption "+caption;
    }
    if (caption.match(/[<\/>]/)) throw 'invalid caption '+caption;
    return caption;
}
