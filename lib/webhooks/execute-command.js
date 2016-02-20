'use strict';

var express = require('express')

module.exports = function(args){
    let router = express.Router();

    router.route('/')
        // execute comands
        .post(function (req, res) {
            console.log('EXEC COMMAND', req.body);
            /*
            token=Msn14rYJPwTVJrUqrsIxfz8V
            team_id=T0001
            team_domain=example
            channel_id=C2147483705
            channel_name=test
            user_id=U2147483697
            user_name=Steve
            command=/weather
            text=94070
            response_url=https://hooks.slack.com/commands/1234/5678
             */
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
