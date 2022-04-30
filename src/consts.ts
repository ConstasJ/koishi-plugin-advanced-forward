import {Schema} from "koishi";

export interface Filter {
    type:'user'|'flag',
    data:string[],
}

interface Rule {
    source:string,
    target:string[],
    filter:Filter,
}

export interface Config {
    rule:Rule[],
}

const Filter=Schema.object({
    type:Schema.union([Schema.const('user'),Schema.const('flag')]).description('转发条件类型').required(),
    data:Schema.array(Schema.string()).description('过滤器数据').required(),
})

export const Rule=Schema.object({
    source:Schema.string().description('转发源频道').required(),
    target:Schema.array(Schema.string()).description('转发目标频道').required(),
    filter:Filter.description('转发过滤器（转发触发条件）').required()
})