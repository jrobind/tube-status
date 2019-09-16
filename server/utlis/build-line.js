const db = require('../models');
const fetch = require("node-fetch");

module.exports = () => {
    db.LinesModel.find({}, async (err, resp) => {
        const response = await fetch('http://localhost:4500/api/lines').catch(e => console.log(e));
        const result = await response.json();
        const lineData = {};
    
        // build db line data
        result.forEach(line => {
            const status = Boolean(line.lineStatuses[0].statusSeverityDescription);
            const description = line.lineStatuses[0].statusSeverityDescription || line.lineStatuses[0].closureText;
            lineData[line.id] = { goodService: status, description };
        });
    
        const newLineData = new db.LinesModel(lineData);
        newLineData.save()
            .then((lines) => console.log('Line data added to db', lines)); 
    });
}
