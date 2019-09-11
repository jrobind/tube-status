import tubeStatusWrapper from './custom-elements/tube-status-wrapper.js';
import tubeLine from './custom-elements/tube-line.js';
import authentication from './custom-elements/authentication.js';
import loading from './custom-elements/loading.js';

window.customElements.define('tube-status-loading', loading);
window.customElements.define('tube-status-wrapper', tubeStatusWrapper);
window.customElements.define('tube-line', tubeLine);
window.customElements.define('tube-status-authentication', authentication);