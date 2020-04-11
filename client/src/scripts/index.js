import tubeStatusWrapper from "./custom-elements/tube-status-wrapper.js";
import tubeLine from "./custom-elements/tube-line.js";
import authentication from "./custom-elements/authentication.js";
import loading from "./custom-elements/loading.js";
import modal from "./custom-elements/modal.js";
import header from "./custom-elements/header.js";
import week from "./custom-elements/week.js";
import time from "./custom-elements/time.js";
import tooltip from "./custom-elements/tooltip.js";
import subscriptions from "./custom-elements/subscriptions.js";
import filter from "./custom-elements/filter.js";
import privacyModal from "./custom-elements/privacy-modal.js";
import toast from "./custom-elements/toast.js";

window.customElements.define("tube-status-modal", modal);
window.customElements.define("tube-status-privacy-modal", privacyModal);
window.customElements.define("tube-status-loading", loading);
window.customElements.define("tube-status-wrapper", tubeStatusWrapper);
window.customElements.define("tube-line", tubeLine);
window.customElements.define("tube-status-header", header);
window.customElements.define("tube-status-authentication", authentication);
window.customElements.define("tube-status-week", week);
window.customElements.define("tube-status-time", time);
window.customElements.define("tube-status-tooltip", tooltip);
window.customElements.define("tube-status-subscriptions", subscriptions);
window.customElements.define("tube-status-filter", filter);
window.customElements.define("tube-status-toast", toast);

