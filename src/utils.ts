import {DRule} from "./db";

export function arrayDeduplicate(arr: any[]) {
    const set = new Set(arr);
    return Array.from(set);
}

export function showRules(rules: DRule[]) {
    let txn = '规则列表：';
    for (let i = 1; i <= rules.length; i++) {
        const rule = rules[i - 1];
        txn += `\n${i}.条件类型：${(rule.filter.type === 'user') ? '用户' : '标签'} 条件数据：${JSON.stringify(rule.filter.data)} 目标频道：${JSON.stringify(rule.target)}`;
    }
    return txn;
}

export function parseDotInArr(str: string) {
    return str.split(',');
}