const fs = require('fs')  
const Path = require('path')  
const axios = require('axios')

const BUFFER_PATH = './buffer'

async function download(url) {  
    const name = getName(url);
    const path = Path.resolve(__dirname, `.${BUFFER_PATH}`, name)
    const writer = fs.createWriteStream(path)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

function getName(url) {
    return url.split('/').at(-1);
}

function getFullName(url) {
    return `${BUFFER_PATH}/${getName(url)}`;
}

module.exports = {
    download, getName, getFullName
}
