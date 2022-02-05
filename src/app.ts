import { compare, format } from './compare';
import { source, target } from './const';

const sourceDiv = document.getElementById('sourceDiv');
const targetDiv = document.getElementById('targetDiv');
const button = document.getElementById("btnCompare");

sourceDiv!.innerHTML = format(JSON.stringify(source));
targetDiv!.innerHTML = format(JSON.stringify(target));

const clickHandler = (source: any, target: any) => {
    const [s, t] = compare(source, target)
    sourceDiv!.innerHTML = s;
    targetDiv!.innerHTML = t;
}

button!.addEventListener('click', clickHandler.bind(null, source, target))
