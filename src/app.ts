import * as jsonpatch from 'fast-json-patch';
import { source, target } from './const';
import { format, join } from './util';
const jsonMap = require('json-source-map');


const getStartAndEndPosOfDiff = (textValue: string, diff: any) => {
    const result = jsonMap.parse(textValue);
    const pointers = result.pointers;
    const path = diff.path;
    const start = {
        line: pointers[path].key
            ? pointers[path].key.line
            : pointers[path].value.line,
        ch: pointers[path].key
            ? pointers[path].key.column
            : pointers[path].value.column,
    };
    const end = {
        line: pointers[path].valueEnd.line,
        ch: pointers[path].valueEnd.column,
    };

    return {
        start: start,
        end: end,
    };
}

const compare = (sourceStr: string, targetStr: string) => {
    const diffList: { origin: string, action: string, start: number, end: number }[] = [];

    const diffs = jsonpatch.compare(source, target);

    diffs.forEach(function (diff) {
        try {
            if (diff.op === 'remove') {
                const pos = getStartAndEndPosOfDiff(sourceStr, diff);
                diffList.push({ origin: "source", action: "remove", start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'add') {
                const pos = getStartAndEndPosOfDiff(targetStr, diff);
                diffList.push({ origin: "target", action: "add", start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'replace') {
                let pos = getStartAndEndPosOfDiff(sourceStr, diff);
                diffList.push({ origin: "source", action: "replace", start: pos.start.ch, end: pos.end.ch })
                pos = getStartAndEndPosOfDiff(targetStr, diff);
                diffList.push({ origin: "target", action: "replace", start: pos.start.ch, end: pos.end.ch })
            }
        } catch (e) {
            console.warn('error while trying to highlight diff', e);
        }
    });

    for (const item of diffList.filter(c => c.origin === "target").sort((a, b) => b.end - a.end)) {
        targetStr = join(targetStr, item.start, item.end, item.action)
        targetDiv!.innerHTML = '<pre>' + format(targetStr).replace(/spanclass/g, 'span class') + '</pre>'
    }
    for (const item of diffList.filter(c => c.origin === "source").sort((a, b) => b.end - a.end)) {
        sourceStr = join(sourceStr, item.start, item.end, item.action)
        sourceDiv!.innerHTML = '<pre>' + format(sourceStr).replace(/spanclass/g, 'span class') + '</pre>'
    }
}

const sourceDiv = document.getElementById('sourceDiv');
const targetDiv = document.getElementById('targetDiv');
const button = document.getElementById("btnCompare");

sourceDiv!.innerText = JSON.stringify(source);
targetDiv!.innerText = JSON.stringify(target);

button!.addEventListener("click", compare.bind(null, JSON.stringify(source), JSON.stringify(target)))
