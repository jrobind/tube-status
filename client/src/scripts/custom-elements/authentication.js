import {store} from "../utils/client-store.js";
const {updateStore, subscribeToStore, getStore} = store;

/** @const {number} */
const LOADING_DELAY = 500;
/** @const {string} */
const SIGN_IN_TEXT = "sign-in to subscribe";
/** @const {string} */
const LOGIN_TEXT = "Log in with Google";

/**
 * Authentication custom element.
 */
export default class Authentication extends HTMLElement {
  /** Create authentication custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.dest_ = this.getAttribute("dest");

    /** @private {string} */
    this.authPath_ = this.getAttribute("auth-path");

    /** @private {string} */
    this.authenticationText_ = this.authPath_ === "subscribe" ?
      SIGN_IN_TEXT :
      LOGIN_TEXT;

    /** @private {string} */
    this.line_ = this.parentElement.parentElement.getAttribute("line");

    /** @private {string} */
    this.token_ = localStorage.getItem("JWT");
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    subscribeToStore({
      callback: this.attemptTextUpdate_.bind(this),
      action: "LINE-SUBSCRIPTION",
    });
    this.addEventListener("click", this.handleAuth_.bind(this));
    this.handleJWT_();
    this.render_();
  }

  /**
   * Verify existence of JWT and parse if present.
   * @private
   */
  async handleJWT_() {
    // if token exists, login was successful
    if (this.token_) {
      const {photos, id} = JSON.parse(window.atob(this.token_.split(".")[1]));

      updateStore({
        action: "AUTH",
        data: {signedIn: true, avatar: photos[0].value, id},
      });
    }
  }

  /**
   * Attempts attribute & authentication text updates after authentication
   * @private
   */
  attemptTextUpdate_() {
    const {userProfile: {signedIn}, lineSubscriptions} = getStore();

    if (!signedIn || this.authPath_ === "logout") return;

    if (this.authPath_ === "login") {
      this.setAttribute("auth-path", "logout");
    } else {
      // check if line subscription exists for current line
      if (lineSubscriptions.includes(this.line_)) {
        this.setAttribute("auth-path", "unsubscribe");
      } else {
        this.setAttribute("auth-path", "subscribe");
      }
    }

    this.authPath_ = this.getAttribute("auth-path");
    this.authenticationText_ = this.authPath_;

    this.render_();
  }

  /**
   * Handles Google authentication process.
   * @private
   */
  handleAuth_() {
    const {userProfile} = getStore();

    switch (this.authPath_) {
    case "login":
      window.location.href = this.dest_;
      break;
    case "logout":
      this.handleLogout_();
      break;
    case "subscribe":
      userProfile.signedIn ?
        this.handleSubscriptionRequest_() :
        window.location.href = this.dest_;
      break;
    case "unsubscribe":
      userProfile.signedIn ?
        this.handleSubscriptionRequest_("unsubscribe") :
        window.location.href = this.dest_;
      break;
    }
  }

  /**
   * Handles the user logout process.
   * @private
   */
  async handleLogout_() {
    updateStore({
      action: "LOADING",
      data: {loadingState: {state: true, line: null}},
    });
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
      },
    };

    // update login status on the server
    const logoutResponse = await fetch("api/logout", options)
      .catch(this.handleError_);
    const status = logoutResponse.status;

    if (status === 200) {
      localStorage.removeItem("JWT");
      updateStore({
        action: "AUTH",
        data: {signedIn: false, avatar: null, id: null},
      });
      // set authentication text back to login
      this.authenticationText_ = LOGIN_TEXT;
      this.authPath_ = "login";
      this.render_();

      updateStore({
        action: "LOADING",
        data: {loadingState: {state: false, line: null}},
      });
      // reload page to reset line subscription states
      window.location.href = "/";
    }
  }

  /**
   * Handles line subscription request.
   * @param {string} subType
   * @private
   */
  async handleSubscriptionRequest_(subType) {
    const {userProfile, pushSubscription, lineSubscriptions} = getStore();
    const method = !subType ? "POST" : "DELETE";
    const body = !subType ?
      JSON.stringify({pushSubscription, line: this.line_}) :
      JSON.stringify({line: this.line_});
    const options = {
      method,
      body,
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
      },
    };

    // activate loading state
    updateStore({
      action: "LOADING",
      data: {loadingState: {state: true, line: this.line_}},
    });

    if (userProfile.signedIn && pushSubscription) {
      const subscriptionResponse = await fetch("api/subscribe", options)
        .catch(this.handleError_);
      const deserialised = await subscriptionResponse.json();

      // push new line subscription to stored array if subscribing,
      // otherwise remove unsubscribed line
      if (!subType) {
        lineSubscriptions.push(deserialised.lines);
      } else {
        lineSubscriptions.splice(
          lineSubscriptions.indexOf(deserialised.lines), 1);
      }
      // set a minimum loading wheel time
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));

      updateStore({
        action: "LINE-SUBSCRIPTION",
        data: {lineSubscriptions},
      });
      updateStore({
        action: "LOADING",
        data: {loadingState: {state: false, line: this.line_}},
      });
    }
  }

  /**
   * Renders link authentication text.
   * @private
   */
  render_() {
    this.innerHTML = this.authenticationText_;
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(`Unable to subscribe to line at this time. ${e}`);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener(this.handleAuth_);
  }
}
