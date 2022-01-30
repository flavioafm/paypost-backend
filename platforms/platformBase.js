const axios = require('axios');

class PlatformBase {

    #request = null;

    constructor(urlBase) {
        this.#request = axios.create({
            baseURL: urlBase,
            headers: {'Content-Type': 'application/json'}
        });
    }

    getRequest() {
        return this.#request;
    }

}

module.exports = PlatformBase;