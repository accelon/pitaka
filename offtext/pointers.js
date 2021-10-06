//unpack array of serialized pointer 
export const dereferencing=arr=>{
    if (typeof arr=='string') arr=[arr];

}
//serialize array of pointers
export const referencing=arr=>{
    if (Array.isArray(arr)) arr=[arr];
}
