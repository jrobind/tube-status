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
  PART_SUSPENDED: "Part Suspended",
  SEVERE_DELAYS: "Severe Delays",
  MINOR_DELAYS: "Minor Delays",
  GOOD_SERVICE: "Good Service",
  SPECIAL_SERVICE: "Special Service",
};
