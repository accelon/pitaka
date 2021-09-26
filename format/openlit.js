
class Formatter {
    constructor (context){
        this.context=context;
    }
    scan(rawlines){
        // console.log('openlit',rawlines.length)
    }
}
const getZipFileOrder=async zip=>{
    const zipfiles=[];
    const index=await zip.files['index.html'].async('string');
    index.replace(/<a href="([\d]+\.html)" target="right_Article"/g,(m,fn)=>{
        if (!zip.files[fn]) console.log(fn,'not found');
        zipfiles.push(fn);
    })
    return zipfiles;
}

export default {getZipFileOrder,Formatter}