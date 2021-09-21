const nodefsready=new Promise(resolve=>{
    if (typeof process!=='undefined' &&  parseInt(process.version.substr(1))>12) {
        import('fs').then(fs=>{
            console.log('fs loaded')
            global.fs=fs;
            resolve(fs);
        })
        
    } else {
        resolve(null)
    }
})
export default nodefsready;