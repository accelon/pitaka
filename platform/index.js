import chromefs from './chromefs.js'
import nodefs from './nodefs.js'

import {readFiles,readTextFile,readBLOBFile} from './inputfiles.js'

const cacheStorageReady=(function(){
    if (typeof document!=='undefined') {
        const p=document.location.protocol;
        const h=document.location.hostname;
        return (p=='https:'|| (p=='http:'&& (h=='localhost'||h=='127.0.0.1')));
    }
    return false;

})();
export {chromefs,nodefs,readFiles,readTextFile,readBLOBFile,cacheStorageReady}