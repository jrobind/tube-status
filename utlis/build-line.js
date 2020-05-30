const db = require("../models");
const fetch = require("node-fetch");
const debug = require("debug")("app:buildline");

module.exports = async () => {
  const url = "http://localhost:4000/api/lines";
  const response = await fetch(url).catch((e) => debug(
    `error fetching line data ${e}`));

  if (response.status === 500) return;

  const result = await response.json();
  const lineData = {};

  // build db line data
  result.forEach((line) => {
    line.lineStatuses.forEach((status) => {
      const {statusSeverityDescription, reason} = status;
      const id = line.id;
      const data = {
        goodService: statusSeverityDescription === "Good Service",
        description: statusSeverityDescription,
        reason: reason || null,
      };

      if (line.lineStatuses.length > 1 && lineData[id]) {
        lineData[id].push(data);
      } else {
        lineData[id] = [data];
      }
    });
  });

  db.LinesModel.findOneAndUpdate({}, lineData, (err, resp) => {
    if (err) debug(`error updating line build ${err}`);
    if (!resp) {
      // first line db entry
      const newLineData = new db.LinesModel(lineData);
      newLineData.save()
        .then((lines) => debug("First line data added to db", lines));
    } else {
      debug("line data updated in db from build-line");
    }
  });
};
