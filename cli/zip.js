const pat=process.argv[3]||'';
let foldername=process.argv[4]||process.cwd().match(/[\\//].+$/)[0];
/*
  pitaka zip *.xml     // create a zip with same folder name in upper folder
  pitaka zip T01       // create T01.zip and with all files in subfolder T01

*/
let subfolder='';
const makezip=()=>{
    let files=fs.readdirSync(".") 
    if (pat) {
        if (fs.existsSync(pat)) {
            files=fs.readdirSync(pat);
            subfolder=pat+'/';
            foldername=pat;
        } else {
            const regex=new RegExp(pat);
            files=files.filter(f=>f.match(regex));    
        }
    }
    files.sort((a,b)=>a>b?1:(a<b?-1:0));

    const zip=new JSZip();

    for (let i=0;i<files.length;i++) {
        process.stdout.write('\r'+files[i]+'   ');
        const filecontent=fs.readFileSync(subfolder+files[i]);
        zip.file( files[i], filecontent);
    }
    zip

    .generateNodeStream({type:'nodebuffer',streamFiles:true,compression:'DEFLATE'})
    .pipe(fs.createWriteStream(foldername+'.zip'))
    .on('finish', function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log(foldername+".zip written",files.length,'files');
    });
}
export default makezip;