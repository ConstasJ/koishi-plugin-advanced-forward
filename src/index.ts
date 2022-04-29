import {Context, Schema} from 'koishi';
import {Config,Rule} from "./consts";

const name = 'advanced-forward';

const schema = Schema.object({
    rule: Schema.array(Rule).description('转发规则'),
})
const using = ['database'] as const;

async function apply(ctx: Context,opts:Config) {
    ctx.middleware(async (session, next) => {

    });
    const cmd=ctx.command('cond-forward','更加高级的条件转发功能')
        .alias('cfwd');
}

export {name, schema, using, apply}