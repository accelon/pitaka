import kluer from '../cli/kluer.js'
const {blue,yellow,red,bgWhite} = kluer;
import { existsSync,unlinkSync,readdirSync,writeSync, close, appendFileSync, readFileSync, openSync} from 'fs';
import { alphabetically } from '../utils/sortedarray.js';
import crc32 from './crc32.js';
import {ROMHEADERSIZE} from './romconst.js';
const packrom=()=>{
    const folder=process.argv[3];
    if (!folder) {
        console.log(red('missing foldername'));
    }

    const files=readdirSync(folder);
    const outfn=folder+'.rom';
    if (existsSync(outfn)) unlinkSync(outfn);
    const outfile=openSync(outfn,'w');

    appendFileSync( outfile,Buffer.from('PITAKA\x1a'+'-'.repeat(25)));

    files.sort((a,b)=>alphabetically);
    const offsets=[], filenames=[];
    let romsize=0,crc=0;
    
    files.forEach(file=>{
        const content=readFileSync(folder+'/'+file);
        filenames.push(file);
        offsets.push(romsize);
        appendFileSync(outfile,content);
        romsize+=content.length;
        crc = (crc+crc32(content)) ^ -1;
    })
    offsets.push(romsize);

    const fileinfo={filenames,offsets};
    appendFileSync(outfile, Buffer.from( JSON.stringify(fileinfo) ) )
    
    //header 32 bytes
    //PITAKA 7 bytes , 9 bytes , reserved 8 bytes, crc32 8 bytes
    writeSync(outfile,(ROMHEADERSIZE+romsize).toString(16).padStart(9,' '), 7 );
    writeSync(outfile,crc.toString(16).padStart(16,' '),7+9 );

    close(outfile);
}
export default packrom;