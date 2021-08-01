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


const build=name=>{  
    const report=buildPitaka({name});
    console.log('\n'+report);
}

const help=()=>{
    console.log('Description: ')
    console.log(' Pitaka command line interface')
    console.log('\nUsage (first char is also good)')
    console.log(yellow(' $ pitaka build'), 'to build a pitaka')
    console.log(yellow(' $ pitaka info'), ' dump information of pitaka')
}

try {
    const name=getWorkingPitakaName();

    ({b:build,build,'--help':help,'-h':help,i:info,info})[cmd](name);
} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}