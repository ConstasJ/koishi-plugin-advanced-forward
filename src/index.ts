import {Context, Schema} from 'koishi';
import {Config, Rule} from "./consts";
import {DRule, getRules, initDB} from "./db";
import {arrayDeduplicate, showRules} from "./utils";
import {defaultFilter} from "./filter";

const name = 'advanced-forward';

const schema = Schema.object({
    rule: Schema.array(Rule).description('转发规则'),
})
const using = ['database'] as const;

async function apply(ctx: Context, opts: Config) {
    initDB(ctx);
    ctx.middleware(async (session, next) => {
        const crule = opts.rule;
        crule.push(...(await getRules(ctx)));
        const rules: DRule[] = arrayDeduplicate(crule);
        for (const rule of rules) {
            if (rule.source === `${session.platform}:${session.channelId}`) {
                if (defaultFilter(rule.filter, session)) {
                    if (session.content) await ctx.broadcast(rule.target, session.content);
                }
            }
        }
        return next();
    });
    const cmd = ctx.command('cond-forward', '更加高级的条件转发功能')
        .alias('cfwd');
    cmd.subcommand('.add <source> <target>', '添加转发', {authority: 3})
        .option('user', '-U <user> 添加用户过滤器')
        .option('flag', '-F <flag> 添加标签过滤器')
        .usage('请使用JSON数组形式指定目标频道/过滤器选项！')
        .check(({options}) => {
            if (JSON.stringify(options) === '{}') return '错误：未指定过滤器！';
        })
        .action(async ({session, options}, src, tgt) => {
            if (options?.user) {
                const target = JSON.parse(tgt);
                const user = JSON.parse(options.user);
                try {
                    await ctx.database.create('cforward', {
                        source: src,
                        target: target,
                        filter: {
                            type: 'user',
                            data: user,
                        }
                    });
                    return '添加成功！';
                } catch (e) {
                    ctx.logger('cforward').error(`Error occured:${e}`)
                    return '发生错误';
                }
            } else {
                const target = JSON.parse(tgt);
                const flag = JSON.parse(options?.flag);
                try {
                    await ctx.database.create('cforward', {
                        source: src,
                        target: target,
                        filter: {
                            type: 'flag',
                            data: flag,
                        }
                    });
                    return '添加成功！';
                } catch (e) {
                    ctx.logger('cforward').error(`Error occured:${e}`)
                    return '发生错误';
                }
            }
        });
    cmd.subcommand('list', '查看转发规则')
        .action(async ({session}) => {
            const rules = await ctx.database.get('cforward', {source: `${session?.platform}:${session?.channelId}`});
            if (session?.send) await showRules(session.send, rules);
            else return '错误：session.send为undefined！'
        });
    cmd.subcommand('.remove', '移除转发规则', {authority: 3})
        .action(async ({}) => {

        });
    cmd.subcommand('.clear', '移除本频道所有转发规则', {authority: 3})
        .action(async ({session})=>{
            try{
                await ctx.database.remove('cforward',{
                    source:`${session?.platform}:${session?.channelId}`
                });
                return '清除成功！';
            }catch (e) {
                ctx.logger('cforward').error(e);
                return '发生错误！'
            }
        })
}

export {name, schema, using, apply}