'use strict';

var slackAPI = require('slackbotapi'),
    CronJob = require('cron').CronJob;

module.exports = function slackBot(args){
    args = args || {};
    args.jobs = args.jobs || [];


    console.log('Start Bot with token:', args.token);

    var slack = new slackAPI({
        'token': args.token,
        'logging': args.logging || false,
        'autoReconnect': args.autoReconnect || true
    });

    slack.on('error', e => console.error('Slack App Error:', e));

    slack.on('close', data => {
        if (data === 1006 && typeof args.tokenRevoked === 'function')
            args.tokenRevoked(token, args);
    });

    // listen to slack message event
    slack.on('message', function (data) {
        let message = data && data.text;
        if (message && typeof args.analyze === 'function')
            args.analyze(slack, message, data);
    });

    slack.cronJobs = [];

    slack.on('hello', ()=>{
        for (let i in args.jobs){
            let schedule = args.jobs[i];

            if (schedule){
                // create new cron job
                slack.cronJobs.push(new CronJob(
                    // job time
                    schedule.when,
                    // execute job
                    function executeJob(){
                        // if job contains a message
                        if (typeof schedule.message === 'string'){
                            // send message to general channel
                            slack.reqAPI('chat.postMessage', {
                                type: 'message',
                                channel: (slack.getChannel(schedule.channel) || {}).id,
                                text: schedule.message
                            });
                        }
                        // if job function is defined
                        if (schedule.exec){
                            schedule.exec();
                        }
                    },
                    // after job ends
                    schedule.end,
                    // start the job right now
                    true
                ));
            }
        }
    });

    return slack;
}
