// when updating store, do not mutate.
export let store = {
    lineData: {
        lines: {}
    }
}

export const updateStore = (data) => {
    const newStore = { ...store, lineData:{ lines: {  ...data } } };
    store = newStore;
    return store.lineData;
}

export const getLine = (line) => {
    for (let [key, value] of Object.entries(store.lineData.lines)) {
        if (value.id === line) return value;
    }
}