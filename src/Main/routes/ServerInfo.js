// Exposes an endpoint to get the server info (configuration, SSL (?), api endpoints, etc)
const router = require('express').Router();

module.exports = function (globalConfig){


    router.get('/', function (req, res) {

        return res.json(globalConfig);

    });

    return router;

}