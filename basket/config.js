export function validateConfig(json,filenames){
    if (!json) return 'empty json'
    if (!json.name) return 'missing "name" field';
    if (!json.name.match(/^[a-z][_a-z\d]*?$/)) return 'invalid "name", should match ([a-z][_a-z0-9]*) '
    if (json.name.length<2) return '"name" too short, should be 3 or more characters'
    if (json.name.length>31) return '"name" too long, should be less than 32 characters'

    for (let i=0;i<json.files.length;i++) {
        const f=json.files[i];
        const at=filenames.indexOf(f);
        if (at==-1) {
            return f+" not selected";
        }
    }
    return null; //ok
}