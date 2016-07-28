'use strict';


var SlackBotApp = require('./libs/slack_app');


// register api: register new token (add app via slack add button)
// commands api: respond to commands
// rtm bot: analyze messages
// cron jobs: send scheduled messages


var sapp = new SlackBotApp({
    // webhooks express app
    express: {
        // pass your already existing express app instance to add the webhooks listeners
        // remember to call app.listen() only after calling the slackbotapp.start() method
        // (otherwise the listener might not be added)
        app: null,
        // use if you want a new an express app be create to listen to webhooks on a specific port
        port: 3000
    },
    // webhooks paths
    webhooks: {
        // register bot token hook, only if app is added with slack add button
        register: '/slack/register-bot',
        // execute command hook, only if using slack commands
        command: '/slack/execute-command'
    },
    // bot credentials
    // needed to the register bot token weebook, only if app is added with slack add button
    credentials: {
        // bot client id
        client_id: 'YOUR_CLIENT_ID',
        // bot client secret
        client_secret: 'YOUR_CLIENT_SECRET'
    },
    // tokens
    tokens: {
        // store the new register token, only if app is added with slack add button
        // avoids manualy re-adding the app to slack after a restart
        // (you might want to store it in a way that you can read it with the retrieve function)
        store: null,
        // list of tokens to start the app with
        // can be a string
        // or an array of string
        // or a promise that will resolve with a string or an array of string
        // or a function that returns a string or an array of string,
        // or a function that accepts a callback that will be called passing a string or an array of string,
        // or a function that accepts return a promise that will resolve with a string or an array of string
        retrieve: null
    },
    // cron jobs
    jobs: [
        {
            // channel filter (execute job only on this channel)
            channel: 'general',
            // time schedule
            when: '00 30 17 * * 5',
            // message to send in the channel
            message: 'Your message here!!',
            // job to execute
            exec: ()=>{},
            // function executed after job stops
            end: ()=>{},
            // timezone
            tz: null
        }
    ],
    analyzers: {
        // command handler
        command: (res, command, text, data) => {
            if (command === 'test')
                res.send({
                    text: 'Hello' + data.user_name,
                    attachments: []
                });
            else
                res.send('Command not implemented yet');
        },
        // message handler
        message: (slack, message, data) => {
            // if result has text or attachments
            if (message === 'hello')
                // sent a message to the channel
                slack.reqAPI('chat.postMessage', {
                    type: 'message',
                    channel: data.channel,
                    text: 'world',
                    attachments: [],
                    as_user: true
                });
        }
    }
});


sapp.start()
