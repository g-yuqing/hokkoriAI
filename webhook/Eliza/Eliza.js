const axios = require('axios')

class Eliza {
    constructor(context) {
        this.context = context
    }

    async GetAnswer(text) {
        const
        //elizaUrl = 'https://hokkoriaiv2.azurewebsites.net/reply',
        elizaUrl = 'https://hksample2.azurewebsites.net/hkreply',
        data = {message: text},
        config = {
            headers: {
            'Content-Type': 'application/json'
            },
        }
        try {
            const elizaRes = await axios.post(elizaUrl, data, config)
            return elizaRes
        } catch (err) {
            this.context.log(`[Eliza GetAnswer]axios post error: ${err}`)
        }
    }
}
module.exports = Eliza

