const db = require("../models");
const debug = require("debug")("app:deletepushsubscription");

const deleteSubscription = (googleId, subscription) => {
  console.log(subscription.endpoint);
  const params = {
    $pull: {"pushSubscription": {"endpoint": subscription.endpoint}}};

  db.UserModel.findOneAndUpdate(
    {googleId},
    params,
    {new: true},
    (err, resp) => {
      if (err) debug(`Failed to remove subscription data ${err}`);
      if (resp) debug("Successfully removed push subscription");
    });
};

module.exports = {deleteSubscription};
