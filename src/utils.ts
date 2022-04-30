export function arrayDeduplicate(arr:any[]){
    const set=new Set(arr);
    return Array.from(set);
}