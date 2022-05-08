import {Context, Schema} from 'koishi';
import {Config, Rule} from "./consts";
import {DRule, getRules, initDB} from "./db";
import {arrayDeduplicate, parseDotInArr, showRules} from "./utils";
import {defaultFilter} from "./filter";

const name = 'advanced-forward';

const schema = Schema.object({
    rule: Schema.array(Rule).description('转发规则'),
})
const using = ['database'] as const;

export default async function apply(ctx: Context, opts: Config) {
    ctx.on('ready', async () => {
        initDB(ctx);
        ctx.middleware(async (session, next) => {
            const crule = (opts && opts.rule) ? opts.rule : [];
            crule.push(...(await getRules(ctx)));
            const rules: DRule[] = arrayDeduplicate(crule);
            for (const rule of rules) {
                if (rule.source === `${session.cid}`) {
                    if (defaultFilter(rule.filter, session)) {
                        if (session.content) await ctx.broadcast(rule.target, `${session.content}`);
                    }
                }
            }
            return next();
        });
        const cmd = ctx.command('cond-forward', '更加高级的条件转发功能')
            .alias('cfwd');
        cmd.subcommand('.add <target> [source]', '添加转发', {authority: 3})
            .option('user', '-U <user> 添加用户过滤器')
            .option('flag', '-F <flag> 添加标签过滤器')
            .usage('请使用JSON数组形式指定目标频道/过滤器选项！')
            .check(({options}) => {
                if (JSON.stringify(options) === '{}') return '错误：未指定过滤器！';
            })
            .action(async ({session, options}, tgt, src) => {
                src = (src) ? src : `${session?.platform}:${session?.channelId}`;
                if (options?.user) {
                    const target = parseDotInArr(tgt);
                    const user = parseDotInArr(options.user);
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
                    const target = parseDotInArr(tgt);
                    const flag = parseDotInArr(options?.flag);
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
        cmd.subcommand('.list', '查看转发规则')
            .action(async ({session}) => {
                const rules = await ctx.database.get('cforward', {source: `${session?.platform}:${session?.channelId}`});
                return showRules(rules);
            });
        cmd.subcommand('.remove', '移除转发规则', {authority: 3})
            .action(async ({session}) => {
                const rules = await ctx.database.get('cforward', {source: `${session?.platform}:${session?.channelId}`});
                await session?.send(showRules(rules) + '\n请输入您想移除的规则');
                const choRaw = await session?.prompt(60000);
                if (isNaN(Number(choRaw))) return '错误：请输入一个数字！'
                const cho = Number(choRaw);
                const dRule = rules[cho - 1];
                try {
                    await ctx.database.remove('cforward', {
                        id: dRule.id,
                    });
                    return '删除成功！';
                } catch (e) {
                    ctx.logger('cforward').error(e);
                    return '发生错误！';
                }
            });
        cmd.subcommand('.clear', '移除本频道所有转发规则', {authority: 3})
            .action(async ({session}) => {
                try {
                    await ctx.database.remove('cforward', {
                        source: `${session?.platform}:${session?.channelId}`
                    });
                    return '清除成功！';
                } catch (e) {
                    ctx.logger('cforward').error(e);
                    return '发生错误！'
                }
            })
    });
}

export {name, schema, using, apply}