const db = require('../models');
const fetch = require("node-fetch");

module.exports = async () => {
    const url = 'http://localhost:4000/api/lines'; 
    const response = await fetch(url).catch(e => console.log(e));
    const result = await response.json();
    const lineData = {};
    // build db line data
    result.forEach(line => {
        const { statusSeverityDescription, reason } = line.lineStatuses[0];

        lineData[line.id] = { 
            goodService: statusSeverityDescription === 'Good Service',
            description: statusSeverityDescription,
            reason
        };
    }); 

    db.LinesModel.findOneAndUpdate({}, lineData, (err, resp) => {
        if (!resp) {
            // first line db entry
            const newLineData = new db.LinesModel(lineData);
            newLineData.save()
                .then((lines) => console.log('First line data added to db', lines));
        } else {
            console.log('line data updated in db from build-line', resp);
        }
    });
}