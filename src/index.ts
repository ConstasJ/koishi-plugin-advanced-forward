import {Context, Schema} from 'koishi';
import {Config,Rule} from "./consts";
import {DRule, getRules, initDB} from "./db";
import {arrayDeduplicate} from "./utils";
import {defaultFilter} from "./filter";

const name = 'advanced-forward';

const schema = Schema.object({
    rule: Schema.array(Rule).description('转发规则'),
})
const using = ['database'] as const;

async function apply(ctx: Context,opts:Config) {
    initDB(ctx);
    ctx.middleware(async (session, next) => {
        const crule=opts.rule;
        crule.push(...(await getRules(ctx)));
        const rules:DRule[]=arrayDeduplicate(crule);
        for(const rule of rules){
            if(rule.source===`${session.platform}:${session.channelId}`){
                if(defaultFilter(rule.filter,session)){
                    if(session.content) await ctx.broadcast(rule.target, session.content);
                }
            }
        }
        return next();
    });
    const cmd=ctx.command('cond-forward','更加高级的条件转发功能')
        .alias('cfwd');
}

export {name, schema, using, apply}