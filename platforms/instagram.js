const PlatformBase = require('./platformBase');

class Instagram extends PlatformBase {

    constructor(){
        super('');
    }

    refreshSummary = async () => {
        //todo...
    }

}

module.exports = new Instagram();