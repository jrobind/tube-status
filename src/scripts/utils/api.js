
export const fetchLineStatus = (line) => {
    const url = `https://api.tfl.gov.uk/Line/london-overground/Disruption?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;

    try {
        const response = await = fetch(url);
        const deserialisedJSON = await repsonse.json();
    } catch(e) {
        throw new Error(e);
    }
}

export const fetchAllLineStatus = () => {
    const url = `https://api.tfl.gov.uk/Line/Mode/tube/Status?app_id=e1ff8d90&app_key=%2040e8038774d4f1324c35203ac2a4f0c2`;

    try {
        const response = await fetch(url);
        const deserialisedJSON = await response.json(); 
    } catch(e) {
        throw new Error(e);
    }
}