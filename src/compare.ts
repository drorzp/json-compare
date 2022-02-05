import * as jsonpatch from 'fast-json-patch';
import { format as _format, getDifPosition, join } from './util';

enum operation {
    ADD = "add",
    REMOVE = "remove",
    REPLACE = "replace"
}

enum origin {
    SOURCE = "source",
    TARGET = "target",
}
export function format(source: any) {
    return `<pre>${_format(source)}</pre>`;
}
export function compare(source: any, target: any) {
    const diffList: { origin: string, operation: string, start: number, end: number }[] = [];
    const diffs = jsonpatch.compare(source, target);
    let sourceStr: string = JSON.stringify(source),
        targetStr: string = JSON.stringify(target);
    diffs.forEach(function (diff) {
        try {
            if (diff.op === operation.REMOVE) {
                const pos = getDifPosition(sourceStr, diff);
                diffList.push({ origin: origin.SOURCE, operation: diff.op, start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === operation.ADD) {
                const pos = getDifPosition(targetStr, diff);
                diffList.push({ origin: origin.TARGET, operation: diff.op, start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === operation.REPLACE) {
                let pos = getDifPosition(sourceStr, diff);
                diffList.push({ origin: origin.SOURCE, operation: diff.op, start: pos.start.ch, end: pos.end.ch })
                pos = getDifPosition(targetStr, diff);
                diffList.push({ origin: origin.TARGET, operation: diff.op, start: pos.start.ch, end: pos.end.ch })
            }
        } catch (e) {
            console.warn('error while trying to highlight diff', e);
        }
    });
    for (const item of diffList.filter(c => c.origin === origin.TARGET).sort((a, b) => b.end - a.end)) {
        targetStr = join(targetStr, item.start, item.end, item.operation)
    }
    for (const item of diffList.filter(c => c.origin === origin.SOURCE).sort((a, b) => b.end - a.end)) {
        sourceStr = join(sourceStr, item.start, item.end, item.operation)
    }
    return [
        `<pre> ${_format(sourceStr).replace(/spanclass/g, 'span class')} </pre>`,
        `<pre> ${_format(targetStr).replace(/spanclass/g, 'span class')} </pre>`
    ]
}