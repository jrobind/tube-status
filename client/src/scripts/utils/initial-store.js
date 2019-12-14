/** @type {object} */
export const initialStore = {
  lineData: {
    lines: {},
  },

  userProfile: {
    signedIn: false,
    id: null,
    avatar: null,
  },

  loadingState: {
    state: false,
    line: null,
  },

  pushSubscription: null,

  lineSubscriptions: [],

  lineInformation: null,
};
