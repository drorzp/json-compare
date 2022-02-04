
import { compare } from './compare';
import { source, target } from './const';

const sourceDiv = document.getElementById('sourceDiv');
const targetDiv = document.getElementById('targetDiv');
const button = document.getElementById("btnCompare");

sourceDiv!.innerText = JSON.stringify(source);
targetDiv!.innerText = JSON.stringify(target);
const clicked = (source: any, target: any) => {
    const [x, y] = compare(source, target)
    targetDiv!.innerHTML = x;
    sourceDiv!.innerHTML = y;
}

button!.addEventListener('click', clicked.bind(null, source, target))
