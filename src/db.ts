import {Context} from 'koishi';
import {Filter} from './consts';

declare module 'koishi'{
    interface Tables{
        cforward:DRule
    }
}

export interface DRule{
    id:number,
    source:string,
    filter:Filter,
    target:string[],
}

export function initDB(ctx:Context) {
    ctx.database.extend('cforward', {
        id: 'integer',
        source: 'string',
        filter: 'json',
        target: 'list',
    }, {
        primary: 'id',
        autoInc: true,
    });
}

export async function getRules(ctx:Context){
    return await ctx.database.get('cforward',{});
}