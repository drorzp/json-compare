import * as jsonpatch from 'fast-json-patch';
import { source, target } from './const';
import { format } from './util';
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
    const targetArr: { start: string, end: string }[] = [];
    const sourceArr: { start: string, end: string }[] = [];

    const diffs = jsonpatch.compare(source, target);

    diffs.forEach(function (diff) {
        try {
            if (diff.op === 'remove') {
                const pos = getStartAndEndPosOfDiff(sourceStr, diff);
                sourceArr.push({ start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'add') {
                const pos = getStartAndEndPosOfDiff(targetStr, diff);
                targetArr.push({ start: pos.start.ch, end: pos.end.ch })
            } else if (diff.op === 'replace') {
                let pos = getStartAndEndPosOfDiff(sourceStr, diff);
                sourceArr.push({ start: pos.start.ch, end: pos.end.ch })
                pos = getStartAndEndPosOfDiff(targetStr, diff);
                targetArr.push({ start: pos.start.ch, end: pos.end.ch })
            }
        } catch (e) {
            console.warn('error while trying to highlight diff', e);
        }
    });
    targetArr.sort((a, b) => +b.end - +a.end)
    sourceArr.sort((a, b) => +b.end - +a.end)
    for (const item of targetArr) {
        const leftPart = targetStr.slice(0, +item.start);
        const colorPart = targetStr.slice(+item.start, +item.end);
        const rightPart = targetStr.slice(+item.end);
        targetStr = leftPart + "<span class='additional'>" + colorPart + "</span>" + rightPart;
        targetDiv!.innerHTML = '<pre>' + format(targetStr).replace(/spanclass/g, 'span class') + '</pre>'
    }
    for (const item of sourceArr) {
        const leftPart = sourceStr.slice(0, +item.start);
        const colorPart = sourceStr.slice(+item.start, +item.end);
        const rightPart = sourceStr.slice(+item.end);
        sourceStr = leftPart + "<span class='missing'>" + colorPart + "</span>" + rightPart;
        sourceDiv!.innerHTML = '<pre>' + format(sourceStr).replace(/spanclass/g, 'span class') + '</pre>'
    }
}

const sourceDiv = document.getElementById('sourceDiv');
const targetDiv = document.getElementById('targetDiv');
const button = document.getElementById("btnCompare");

sourceDiv!.innerText = JSON.stringify(source);
targetDiv!.innerText = JSON.stringify(target);

button!.addEventListener("click", compare.bind(null, JSON.stringify(source), JSON.stringify(target)))
