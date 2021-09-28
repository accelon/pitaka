#!/usr/bin/env node
/*
  Pitaka command line interface

  npx pitaka

*/
const cmd=process.argv[2] || '-h';
const arg=process.argv[3];
import kluer from './kluer.js' //copy from https://github.com/lukeed/kleur/
const {blue,yellow,red,bgWhite} = kluer;
import nodefs from '../platform/nodefs.js';
await nodefs;
import {existsSync,  readFileSync} from 'fs';
import {buildPitaka} from './build.js'
import {info} from './info.js';
import validate from "./validate.js"
const pitakajson=arg||'pitaka.json';

const jsonp=()=>build(true);
const build=async (jsonp=false)=>{  
    if (!existsSync(pitakajson)) {
        console.log(red('pitaka.json not found'));
        return 
    }
    const config=JSON.parse(readFileSync(pitakajson,'utf8').trim());
    const builder=await buildPitaka( {config}  );
    if (jsonp) {
        builder.saveJSONP({jsonp});
    } else {
        builder.save();
    }
}
const help=()=>{
    console.log('Description: ')
    console.log(' Pitaka command line interface')
    console.log('\nUsage: ')
    console.log(yellow('$ pitaka build   '), 'build pitaka rom file')
    console.log(yellow('$ pitaka jsonp   '), 'build pitaka jsonp folder')
    console.log(yellow('$ pitaka info    '), 'dump information of pitaka')
    console.log(yellow('$ pitaka validate'), 'validate all htm files')
    // console.log(yellow(' $ pitaka pack    '), 'pack folder to a rom file')
}


try {
    ({v:validate,validate,
        j:jsonp,jsonp,
        '--help':help,'-h':help,i:info,info,build,b:build})[cmd]();
} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}
