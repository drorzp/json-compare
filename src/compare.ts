import * as jsonpatch from 'fast-json-patch';
import { format, getDifPosition, join } from './util';

export function compare(source: any, target: any) {
    const diffList: { origin: string, action: string, start: number, end: number }[] = [];
    const diffs = jsonpatch.compare(source, target);
    let sourceStr: string = JSON.stringify(source),
        targetStr: string = JSON.stringify(target);
    diffs.forEach(function (diff) {
        try {
            if (diff.op === 'remove') {
                const pos = getDifPosition(sourceStr, diff);
                diffList.push({ origin: 'source', action: 'remove', start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'add') {
                const pos = getDifPosition(targetStr, diff);
                diffList.push({ origin: 'target', action: 'add', start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'replace') {
                let pos = getDifPosition(sourceStr, diff);
                diffList.push({ origin: 'source', action: "replace", start: pos.start.ch, end: pos.end.ch })
                pos = getDifPosition(targetStr, diff);
                diffList.push({ origin: 'target', action: 'replace', start: pos.start.ch, end: pos.end.ch })
            }
        } catch (e) {
            console.warn('error while trying to highlight diff', e);
        }
    });
    for (const item of diffList.filter(c => c.origin === "target").sort((a, b) => b.end - a.end)) {
        targetStr = join(targetStr, item.start, item.end, item.action)
    }
    for (const item of diffList.filter(c => c.origin === "source").sort((a, b) => b.end - a.end)) {
        sourceStr = join(sourceStr, item.start, item.end, item.action)
    }
    return [
        '<pre>' + format(sourceStr).replace(/spanclass/g, 'span class') + '</pre>',
        '<pre>' + format(targetStr).replace(/spanclass/g, 'span class') + '</pre>']
}