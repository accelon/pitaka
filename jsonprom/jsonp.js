import pool from '../basket/pool.js'
const jsonp=function(chunk,header,_payload){
    const payload=_payload.split(/\r?\n/);
    const rom=pool.get(header.name);
    if (!rom) {
        console.error('error name',header.name);
        return;
    }
    rom.setChunk(chunk,header,payload);
}


export default jsonp;