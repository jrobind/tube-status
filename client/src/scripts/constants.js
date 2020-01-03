/**
 * Client store action types.
 * @enum {string}
 */
export const actions = {
  LINES: "LINES",
  AUTHENTICATION: "AUTH",
  LOADING_APP: "LOADING-APP",
  LOADING: "LOADING",
  PUSH_SUBSCRIPTION: "PUSH-SUBSCRIPTION",
  LINE_SUBSCRIPTION: "LINE-SUBSCRIPTION",
  SELECTED_DAYS: "SELECTED-DAYS",
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
