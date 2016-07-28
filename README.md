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
var SlackApp = require('slack-app');

var sapp = new SlackApp(/* your config */);
```
