import tubeStatusWrapper from "./custom-elements/tube-status-wrapper.js";
import tubeLine from "./custom-elements/tube-line.js";
import authentication from "./custom-elements/authentication/authentication.js";
import loading from "./custom-elements/loading/loading.js";
import modal from "./custom-elements/modal.js";
import header from "./custom-elements/header/header.js";
import week from "./custom-elements/week.js";
import time from "./custom-elements/time.js";
import tooltip from "./custom-elements/tooltip.js";
import subscriptions from "./custom-elements/subscriptions.js";
import filter from "./custom-elements/filter/filter.js";
import privacyModal from "./custom-elements/privacy-modal.js";
import toast from "./custom-elements/toast.js";

customElements.define("tube-status-modal", modal);
customElements.define("tube-status-privacy-modal", privacyModal);
customElements.define("tube-status-loading", loading);
customElements.define("tube-status-wrapper", tubeStatusWrapper);
customElements.define("tube-line", tubeLine);
customElements.define("tube-status-header", header);
customElements.define("tube-status-authentication", authentication);
customElements.define("tube-status-week", week);
customElements.define("tube-status-time", time);
customElements.define("tube-status-tooltip", tooltip);
customElements.define("tube-status-subscriptions", subscriptions);
customElements.define("tube-status-filter", filter);
customElements.define("tube-status-toast", toast);
