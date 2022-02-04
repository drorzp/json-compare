
import { compare } from './compare';
import { source, target } from './const';

const sourceDiv = document.getElementById('sourceDiv');
const targetDiv = document.getElementById('targetDiv');
const button = document.getElementById("btnCompare");

sourceDiv!.innerText = JSON.stringify(source);
targetDiv!.innerText = JSON.stringify(target);
const clicked = (source: any, target: any) => {
    const [s, t] = compare(source, target)
    targetDiv!.innerHTML = t;
    sourceDiv!.innerHTML = s;
}

button!.addEventListener('click', clicked.bind(null, source, target))
