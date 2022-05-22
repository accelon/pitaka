export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(f,ms){
    let timer;
    return function(...args){
        clearTimeout(timer);
        timer=setTimeout( f.bind(this,...args) , ms)
    }
}