export const initialStore = {
  /** @private {object} */
  lineData: {
    lines: {}
  },

  /** @private {object} */
  userProfile: {
    signedIn: false,
    id: null,
    avatar: null,
  },

  /** @private {object} */
  loadingState: {
    state: false,
    line: null,
  },

  /** @private {object} */
  pushSubscription: null,

  /** @private {array} */
  lineSubscriptions: [],

  /** @private {object} */
  lineInformation: null,
};