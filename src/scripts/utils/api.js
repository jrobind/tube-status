
export const fetchLineStatus = async (line) => {
    const url = `https://api.tfl.gov.uk/Line/${line}/Disruption?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;

    try {
        const response = await fetch(url);
        const deserialisedJSON = await response.json();
        return deserialisedJSON;
    } catch(e) {
        throw new Error(e);
    }
}

export const fetchAllLineStatus = async () => {
    const url = `https://api.tfl.gov.uk/Line/Mode/tube/Status?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;
    const rail =  { name: 'TfL Rail', id:  'tfl-rail', lineStatuses: null };

    try {
        const responseAll = await fetch(url);
        const railResponse = await fetchLineStatus('tfl-rail');

        const deserialisedJSON = await responseAll.json(); 

        rail.lineStatuses = railResponse.length ? railResponse : { statusSeverityDescription: 'Good Service' };
       
        deserialisedJSON.push(rail);

        return deserialisedJSON;
    } catch(e) {
        throw new Error(e);
    }
}