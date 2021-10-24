import {PITAKA_EXT} from './constants.js'
const nodefsready=new Promise(resolve=>{
    if (typeof process!=='undefined' &&  parseInt(process.version.substr(1))>12) {
        import('fs').then(fs=>{
            global.fs=fs;
            import('path').then(p=>{
                global.Path=p;
                import('./lazip.js').then(p=>{
                    global.LaZip=p;
                    resolve(fs);
                });
            })

        })
    } else {
        resolve(null)
    }
})

export default nodefsready;