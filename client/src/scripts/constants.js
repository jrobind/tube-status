/* eslint-disable max-len */
/**
 * Client store action types.
 * @enum {string}
 */
export const actions = {
  LINES: "LINES",
  AUTHENTICATION: "AUTH",
  LOADING_APP: "LOADING-APP",
  LOADING_LINE: "LOADING-LINE",
  LOADING_HEADER: "LOADING-HEADER",
  PUSH_SUBSCRIPTION: "PUSH-SUBSCRIPTION",
  LINE_SUBSCRIBE: "LINE-SUBSCRIBE",
  LINE_UNSUBSCRIBE: "LINE-UNSUBSCRIBE",
  SELECTED_DAYS: "SELECTED-DAYS",
  SELECTED_HOURS: "SELECTED-HOURS",
  RESET_SELECTED: "RESET-SELECTED",
  RESET_APP: "RESET-APP",
  RESET_STORE: "RESET-STORE",
  NOTIFICATIONS_FEATURE: "NOTIFICATIONS-FEATURE",
};

/**
 * Custom event types.
 * @enum {string}
 */
export const customEvents = {
  LINE_CLICK: "line-click",
  MODAL_CLOSE: "modal-close",
  SHOW_SUBSCRIBE: "show-subscribe",
  SHOW_WEEK: "show-week",
  SHOW_TIME: "show-time",
  TIME: "time-selected",
  FILTER_SUBSCRIPTIONS: "filter-subscriptions",
  SUBSCRIPTIONS_LOADED: "subscriptions-loaded",
  READY: "app-ready",
  PRIVACY_POLICY: "privacy-policy",
  IO_SUBSCRIPTION_ACTION: "io-subscription-action",
  IO_LOGOUT_ACTION: "io-logout-action",
  CONNECT: "connect",
};

/**
 * Tube line service types.
 * @enum {string}
 */
export const delayTypes = {
  NO_SERVICE: "No Service",
  SERVICE_CLOSED: "Service Closed",
  PART_CLOSURE: "Part Closure",
  PLANNED_CLOSURE: "Planned Closure",
  SUSPENDED: "Suspended",
  PART_SUSPENDED: "Part Suspended",
  SEVERE_DELAYS: "Severe Delays",
  MINOR_DELAYS: "Minor Delays",
  GOOD_SERVICE: "Good Service",
  REDUCED_SERVICE: "Reduced Service",
  SPECIAL_SERVICE: "Special Service",
};

/**
 * Copy.
 * @enum {string}
 */
export const copy = {
  TOOLTIP_MSG_SUBSCRIBE: "Subscribe for line notifications",
  TOOLTIP_MSG_NO_PUSH_SUPPORT: "This browser does not support Push notifications",
  TOOLTIP_MSG_UNSUBSCRIBE: "Unsubscribe from line notifications",
  TOOLTIP_UNAVAILABLE: "Unavailable at this time",
  SUBSCRIPTION_ERROR_MSG: "Unable to subscribe to line at this time.",
  NO_SUBSCRIPTIONS: "There are currently no subscriptions",
  TOAST_DELETE: "Account successfully deleted.",
  TOAST_SUBSCRIBE: "Line successfully subscribed!",
  TOAST_UNSUBSCRIBE: "Line successfully unsubscribed.",
  NOTE_PUSH_API: "To use Push notifications, please sign in with a different browser or accept notification permissions for this app.",
  NOTE_PWA: "This app has been added to your homescreen. To sign in, please use the app.",
  SUBSCRIPTIONS: "Subscriptions",
  SUBSCRIPTIONS_NONE: "No subscriptions",
};
