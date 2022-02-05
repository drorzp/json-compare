const jsonMap = require('json-source-map');

export function format(json: string) {
    var i = 0,
        il = 0,
        tab = '    ',
        newJson = '',
        indentLevel = 0,
        inString = false,
        currentChar = null;

    for (i = 0, il = json.length; i < il; i += 1) {
        currentChar = json.charAt(i);

        switch (currentChar) {
            case '{':
            case '[':
                if (!inString) {
                    newJson += currentChar + '\n' + repeat(tab, indentLevel + 1);
                    indentLevel += 1;
                } else {
                    newJson += currentChar;
                }
                break;
            case '}':
            case ']':
                if (!inString) {
                    indentLevel -= 1;
                    newJson += '\n' + repeat(tab, indentLevel) + currentChar;
                } else {
                    newJson += currentChar;
                }
                break;
            case ',':
                if (!inString) {
                    newJson += ',\n' + repeat(tab, indentLevel);
                } else {
                    newJson += currentChar;
                }
                break;
            case ':':
                if (!inString) {
                    newJson += ': ';
                } else {
                    newJson += currentChar;
                }
                break;
            case ' ':
            case '\n':
            case '\t':
                if (inString) {
                    newJson += currentChar;
                }
                break;
            case '"':
                if (i > 0 && json.charAt(i - 1) !== '\\') {
                    inString = !inString;
                }
                newJson += currentChar;
                break;
            default:
                newJson += currentChar;
                break;
        }
    }


    return newJson;
}

const repeat = (s: string, count: number) => {
    return new Array(count + 1).join(s);
}

export function join(str: string, start: number, end: number, classType: string): string {
    const leftPart = str.slice(0, start);
    const colorPart = str.slice(start, end);
    const rightPart = str.slice(end);
    return `${leftPart} <span class='${classType}'>${colorPart}</span>${rightPart}`
}

export function getDifPosition(textValue: string, diff: any) {
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