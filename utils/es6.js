export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(f,ms){
    return function(){
        let timer;
        clearTimeout(timer);
        timer=setTimeout(f,ms)
    }
}