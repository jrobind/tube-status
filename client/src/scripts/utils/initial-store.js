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
  selectedSubscriptionWindow: {
    days: null,
    hours: null,
  },
  lineSubscriptions: [{
    line: null,
    days: null,
    hours: null,
  }],
  lineInformation: null,
};
