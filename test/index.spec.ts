import {App} from 'koishi';
import mock from '@koishijs/plugin-mock';

const app=new App();
app.plugin(mock);
app.plugin('database-memory')

const cli1=app.mock.client('123','456');
const cli2=app.mock.client('789','654');

before(async ()=>{
    await app.start();
    await app.mock.initChannel('456');
    await app.mock.initChannel('654');
    await app.mock.initUser('123',3);
    await app.mock.initUser('789',3);
})

describe('The Conditional Forwarding Plugin for Koishi.js',()=>{

})