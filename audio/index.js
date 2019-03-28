const request = require('request-promise')

module.exports = async function (context, req) {
    req.url = 'http://hokkoriai-vm.japaneast.cloudapp.azure.com/audio'
    const res = await request(req)
    context.res = {
        body: res
    }
    context.done() 
};