'use strict';

var express = require('express')

module.exports = function(args){
    let router = express.Router();

    router.route('/')
        // execute comands
        .post(function (req, res) {
            let data = req.body || {};
            let command = (data.command || '').replace('/',''),
            text = data.text;

            if (typeof args.analyze === 'function'){
                args.analyze(res, command, text, data);
            }
            else {
                res.send();
            }
        });

    return router;
}
