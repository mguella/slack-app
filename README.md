# Slack App

Build your own Slack app.
This module simplify the process of creating a Slack app by providing:
- **Send data into Slack with Incoming Webhooks**:
- **Invoke actions outside of Slack with Commands**
- **Build a bot user**: connects in real time via websockets
- **Use Advanced APIs**

## Installation

```
npm install --save slack-app
```

## Usage

```
// require the module
var SlackApp = require('slack-app');

// define the app
var sapp = new SlackApp({
    // webhooks express app
    express: {
        // pass your already existing express app instance to add the webhooks listeners
        // remember to call app.liste() only after calling the slackbotapp.start() method
        // (otherwise the listener might not be added)
        app: Object,
        // use if you want a new an express app be create to listen to webhooks on a specific port
        port: Number
    },
    // webhooks paths
    webhooks: {
        // register bot token hook, only if app is added with slack add button
        register: String,
        // execute command hook, only if using slack commands
        command: String
    },
    // bot credentials
    // needed to the register bot token weebook, only if app is added with slack add button
    credentials: {
        // bot client id
        client_id: String,
        // bot client secret
        client_secret: String
    },
    // tokens
    tokens: {
        // store the new register token, only if app is added with slack add button
        // avoids manualy re-adding the app to slack after a restart
        // (you might want to store it in a way that you can read it with the retrieve function)
        store: Function,
        // list of tokens to start the app with
        // can be a string
        // or an array of string
        // or a promise that will resolve with a string or an array of string
        // or a function that returns a string or an array of string,
        // or a function that accepts a callback that will be called passing a string or an array of string,
        // or a function that accepts return a promise that will resolve with a string or an array of string
        retrieve: String | Array | Function | Promise
    },
    // cron jobs
    jobs: [
        {
            // channel filter (execute job only on this channel)
            channel: String,
            // time schedule
            when: String,
            // message to send in the channel
            message: String,
            // job to execute
            exec: Function,
            // function executed after job stops
            end: Function,
            // timezone
            tz: String
        }
    ],
    analyzers: {
        // command handler
        command: Function,
        // message handler
        message: Function
    }
});

// start the app
sapp.start()

```


See example in `/examples`.
