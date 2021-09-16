#!/usr/bin/env node
/*
  Pitaka command line interface

  npx pitaka

*/
const cmd=process.argv[2] || '-h';
import kluer from './kluer.js' //copy from https://github.com/lukeed/kleur/
const {blue,yellow,red,bgWhite} = kluer;

import {buildPitaka,getWorkingPitakaName} from './build.js'
import {info} from './info.js';
import validate from "./validate.js"
// import pack from "../rom/pack.js"

const rom=name=>jsonp(name,true);
const jsonp=(name,rom=false)=>{  
    const report=buildPitaka({name,rom});
    console.log('\n'+report);
}
const help=()=>{
    console.log('Description: ')
    console.log(' Pitaka command line interface')
    console.log('\nUsage: ')
    console.log(yellow('$ pitaka jsonp   '), 'build pitaka jsonp folder')
    console.log(yellow('$ pitaka rom     '), 'build pitaka rom file')
    console.log(yellow('$ pitaka info    '), 'dump information of pitaka')
    console.log(yellow('$ pitaka validate'), 'validate all htm files')
    // console.log(yellow(' $ pitaka pack    '), 'pack folder to a rom file')
}

try {
    const name=getWorkingPitakaName();

    ({v:validate,validate,
        j:jsonp,jsonp,
        '--help':help,'-h':help,i:info,info,rom,r:rom})[cmd](name);
} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}