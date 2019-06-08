import store from '../store.js';

export default class TubeStatusWrapper extends HTMLElement {
    connectedCallback() {
        const heading = document.createElement('h1');
        heading.innerText = 'Hello world';
        this.appendChild(heading);

        store.lineData.lines['central'] = 'disruptions';
    }
}

window.customElements.define('tube-status-wrapper', TubeStatusWrapper);