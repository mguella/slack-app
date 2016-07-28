'use strict';

var express = require('express'),
    request = require('superagent'),
    slackBot = require('../bot');

module.exports = function(args){
    args = args || {};
    let router = express.Router();

    router.route('/')
        // register new bots via oauth
        .get(function (req, res) {
            var data = {
                client_id: args.client_id,
                client_secret: args.client_secret,
                code: req.query.code
            };

            request.post('https://slack.com/api/oauth.access')
                .type('form')
                .send(data)
                .end(function (error, response) {
                    if (!error && response.ok && response.body.ok) {
                        console.log('BOT OAUTH', response.body);
                        var b = response.body,
                            token = b.bot.bot_access_token || b.access_token;

                        if (typeof args.store === 'function'){
                            args.store(token, b);
                        }

                        // TODO: STORE TOKEN SOMEWHERE TO RELOAD ON START
                        slackBot({
                            token: token,
                            analyze: args.analyze,
                            jobs: args.jobs,
                            tokenRevoked: args.tokenRevoked
                        });

                    }
                });

            res.send({ success: true });
        });

    return router
}
