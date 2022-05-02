import {App} from 'koishi';
import {expect, use} from 'chai';
import shape from 'chai-shape';
import * as jest from 'jest-mock';
import cfwd from '../src';
import mock from '@koishijs/plugin-mock';

use(shape);

const app = new App();
app.plugin(mock);
app.plugin('database-memory');
app.plugin(cfwd);

const cli1 = app.mock.client('123', '456');
const cli1n = app.mock.client('321', '456');
const cli2 = app.mock.client('789', '654');

before(async () => {
    await app.start();
})

describe('The Conditional Forwarding Plugin for Koishi.js', () => {
    beforeEach(async () => {
        await app.mock.initChannel('456');
        await app.mock.initChannel('654');
        await app.mock.initUser('123', 3);
        await app.mock.initUser('789', 3);
    })
    describe('Command support', () => {
        it('Should correctly add the mode', async () => {
            await cli1.shouldReply('cfwd.add -U mock:123 mock:654 mock:456', '添加成功！');
            const rules = await app.database.get('cforward', {});
            const rule = rules[0];
            expect(rule.target).to.eql(['mock:654']);
            expect(rule.filter).to.eql({
                type: 'user',
                data: ['mock:123']
            });
        });
        it('Should correctly display the rules.', async () => {
            await cli1.shouldReply('cfwd.add -U mock:123 mock:654 mock:456', '添加成功！');
            await cli1.shouldReply('cfwd.list', '规则列表：\n1.条件类型：用户 条件数据：["mock:123"] 目标频道：["mock:654"]');
        });
        /* it('Should correctly delete the rule.',async ()=>{
            await cli1.shouldReply('cfwd.add -U mock:123 mock:654 mock:456' ,'添加成功！');
            await cli1.shouldReply('cfwd.remove','规则列表：\n1.条件类型：用户 条件数据：["mock:123"] 目标频道：["mock:654"]\n请输入您想移除的规则');
            await cli1.shouldReply('1','删除成功！');
            const rules=await app.database.get('cforward',{source:'mock:456'});
            expect(rules.length).to.equal(0);
        }); */
        it('Should correctly clear the rules.', async () => {
            await cli1.shouldReply('cfwd.add -U mock:123 mock:654 mock:456', '添加成功！');
            await cli1.shouldReply('cfwd.add -F ASDD mock:654 mock:456', '添加成功！');
            await cli1.shouldReply('cfwd.clear', '清除成功！');
            const rules = await app.database.get('cforward', {source: 'mock:456'});
            expect(rules.length).to.equal(0);
        })
    });
    describe('Fundamental functions', () => {
        let send = app.bots[0].sendMessage = jest.fn(async () => ['2000']);
        it('Should correctly forwarding the USER CONDITION messages.', async () => {
            await cli1.shouldReply('cfwd.add -U mock:123 mock:654 mock:456', '添加成功！');
            await cli1n.shouldNotReply('Hello!');
            expect(send.mock.calls).to.have.length(0);
            await cli1.shouldNotReply('Hello!');
            expect(send.mock.calls).to.have.length(1);
            expect(send.mock.calls).to.have.shape([['654', '123:Hello!']])
            send.mockClear();
        });
        it('Should correctly forwarding the FLAG CONDITION messages.', async () => {
            await cli1.shouldReply('cfwd.add -F ASDD mock:654 mock:456', '添加成功！');
            await cli1.shouldNotReply('Hello!');
            expect(send.mock.calls).to.have.length(0);
            await cli1.shouldNotReply('[ASDD]Hello!');
            expect(send.mock.calls).to.have.length(1);
            expect(send.mock.calls).to.have.shape([['654', '123:[ASDD]Hello!']]);
        })
    })
    afterEach(async () => {
        await app.database.dropAll();
    })
})