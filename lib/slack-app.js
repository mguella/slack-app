'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    slackBot = require('./bot'),
    routes = {
        register: require('./webhooks/register-token'),
        command: require('./webhooks/execute-command')
    };

/**
 * Slack App
 *
 * @param {Object} args arguments
 * @param {Object} [args.express] arguments
 * @param {Object} [args.express.app] arguments
 * @param {Object} [args.express.port] arguments
 * @param {Object} [args.webhooks] arguments
 * @param {Object} [args.webhooks.register] arguments
 * @param {Object} [args.webhooks.command] arguments
 *
 */
function SlackApp(args){
    this._args = args || {};

}

/**
 * Start Slack App
 * register: add app to team
 * commands: respond to commands
 * rtm bot: analyze messages
 * cron jobs: send scheduled messages
 */
SlackApp.prototype.start = function start(){
    // start bots: rtm + cron jobs
    this.startBot();
    // start web hooks: register + commands
    this.startWebhooks();
}

SlackApp.prototype.analyze = function analyze(key, fun){
    this._args.analyze = this._args.analyze || {};
    this._args.analyze[key] = fun;
}


/**
 * Start bot: rtm + cron jobs
 * if tokens are passed use them to start new bots
 * if tokens is a function call it to retrieve the tokens
 */

SlackApp.prototype.startBot = function startBot(){
    let self = this,
        tokens = self._args.tokens && self._args.tokens.retrieve || self._args.tokens,
        analyzers = self._args.analyzers || {};

    function _startBots(tokens){
        console.log('_startBots', tokens);
        // if tokens is a string
        if (typeof tokens === 'string'){
            // create array with the string
            tokens = [tokens];
        }
        // if tokens is an array
        if (Array.isArray(tokens))
            // for each token
            tokens.forEach(token => {
                // if token is a string
                if (typeof token === 'string'){
                    // start a new bot
                    slackBot({
                        token: token,
                        jobs: self._args.jobs,
                        analyze: analyzers.message,
                        tokenRevoked: (self._args.tokens || {}).revoke
                    });
                }
            })
    }
    // if tokens is defined
    if (tokens){
        // if tokens is a string or an array
        if (typeof tokens === 'string' || Array.isArray(tokens))
            // start bots with given tokens
            _startBots(tokens);
        // otherwise, if tokens is a promise
        else if (tokens && typeof tokens.then === 'function')
            // is promise resolved with tokens
            tokens.then(tokens => {
                // start bots with given tokens
                _startBots(tokens);
            })
        // otherwise, if tokens is a function
        else if (typeof tokens === 'function'){
            // execute the function with startBots function as a callback
            let result = tokens(_startBots);
            // if result is a string or an array
            if (typeof result === 'string' || Array.isArray(result))
                // start bots with given tokens
                _startBots(result);
            // otherwise is result
            else if (result && typeof result.then === 'function')
                // is promise resolved with tokens
                result.then(tokens => {
                    // start bots with given tokens
                    _startBots(tokens);
                })
        }
    }
}


/**
 * Start webhooks: register + commands
 * define a new express app and start if one not passed
 * add the webhooks to the express app
 */

SlackApp.prototype.startWebhooks = function startWebhooks(){
    let self = this;

    let exps = self._args.express || {},
        port = exps.port || 3000,
        hooks = self._args.webhooks || {},
        analyzers = self._args.analyzers || {};

    /**
     * Create new express app if needed
     */

    // if express app passed as argument
    if (exps.app){
        // store app instance
        self._webapp = exps.app
    }
    // otherwise if express app not existing
    // and at least one hook is defined
    else if ((hooks.register || hooks.command)){
        // create new app instance and store it
        self._webapp = express();

        // use bodyparser
        self._webapp.use(bodyParser.json());
        self._webapp.use(bodyParser.urlencoded({
            extended: true
        }));
    }


    /**
     * Register token webhook
     * register new token and start a new slackbot
     * only if app is added via slack add button
     */

    if (hooks.register){
        let credentials = self._args.credentials || {},
            register = routes.register({
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                store: self._args.tokens.store,
                analyze: analyzers.message,
                jobs: self._args.jobs,
                tokenRevoked: (self._args.tokens || {}).revoke
            })
        self._webapp.use(hooks.register, register);
    }

    /**
     * Execute commands webhook
     * execute slack commands and return a response
     */

    if (hooks.command){
        let command = routes.command({
            analyze: analyzers.command
        });
        self._webapp.use(hooks.command, command);
    }

    /**
     * Start express app if just created (not passed as argument)
     */

    // if express app is defined
    // and not passed as argument
    if (self._webapp && !exps.app){
        // listen on given port
        self._webapp.listen(port, () => {
            console.log(`App listening on port ${port}!`);
        });
    }

}


module.exports = SlackApp;
