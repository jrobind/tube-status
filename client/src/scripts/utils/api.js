export const fetchLineStatus = async (line) => {
    const url = `https://api.tfl.gov.uk/Line/${line}/Disruption?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;
    let template = { name: null, id: null, lineStatuses: null };

    switch(line)  {
        case 'tfl-rail': 
            template = { name: 'Tfl Rail', id: 'tfl-rail', lineStatuses: null };
            break;
        case 'london-overground': 
            template = { name: 'Overground', id: 'london-overground', lineStatuses: null };
            break;
        case 'dlr': 
            template = { name: 'dlr', id: 'dlr', lineStatuses: null };
    }

    try {
        const response = await fetch(url);
        const deserialisedJSON = await response.json();

        template.lineStatuses = deserialisedJSON.length ? deserialisedJSON : [{ statusSeverityDescription: 'Good Service' }];

        return template;
    } catch(e) {
        throw new Error(e);
    }
}

export const fetchAllLineStatus = async () => {
    const url = `https://api.tfl.gov.uk/Line/Mode/tube/Status?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;

    try {
        const [ all, rail, overground, dlr ] = await Promise.all([fetch(url), fetchLineStatus('tfl-rail'), fetchLineStatus('london-overground'), fetchLineStatus('dlr')]);
        const deserialisedJSON = await all.json(); 

        return deserialisedJSON.concat([rail, overground, dlr]);
    } catch(e) {
        throw new Error(e);
    }
}