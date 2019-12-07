export const initialStore = {
  /** @type {object} */
  lineData: {
    lines: {}
  },

  /** @type {object} */
  userProfile: {
    signedIn: false,
    id: null,
    avatar: null,
  },

  /** @type {object} */
  loadingState: {
    state: false,
    line: null,
  },

  /** @type {object} */
  pushSubscription: null,

  /** @type {array} */
  lineSubscriptions: [],

  /** @type {object} */
  lineInformation: null,
};