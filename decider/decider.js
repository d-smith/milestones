const stateMachineArn = process.env.STATE_MACHINE_ARN;
const workflowDomain = process.env.WORKFLOW_DOMAIN;
const workflowType = process.env.WORKFLOW_TYPE;
const workflowVersion = process.env.WORKFLOW_VERSION;
const workflowTasklist = process.env.WORKFLOW_TASKLIST;

const AWS = require('aws-sdk');
const swf = new AWS.SWF();
const _ = require('lodash');

const makeid = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

const deciderId=makeid();

const scheduleFirstActivity = async (events) => {
    let filtered = _.filter(events, (o) => { return o.eventType != 'DecisionTaskStarted'
                         && o.eventType != 'DecisionTaskScheduled'
                        && o.eventType != 'DecisionTaskTimedOut' });
    return filtered.length == 1;
}

const performDecisionTask = async (task) => {
    console.log(JSON.stringify(task));
    console.log('schedule first activity?')
    if(scheduleFirstActivity(task.events)) {
        //schedule first activity
        console.log('schedule activity 1');
        let response = await swf.respondDecisionTaskCompleted({
            taskToken: task.taskToken,
            decisions: [
                {
                    decisionType: 'ScheduleActivityTask',
                    scheduleActivityTaskDecisionAttributes: {
                        activityId: `milestone1-act-${makeid()}`,
                        activityType: {
                            name: 'milestone1',
                            version: '1'
                        },
                        control: 'control relevant data',
                        input: 'activity input',
                        scheduleToCloseTimeout: `${5 * 60}`,
                        taskList: {
                            name: 'milestone-activity-tasklist'
                        },
                        scheduleToStartTimeout: `${24 * 60 * 60}`,
                        startToCloseTimeout: `300`,
                        heartbeatTimeout: '300'
                    }
                }
            ]
        }).promise();

        
        console.log(`schedule activity response: ${JSON.stringify(response)}`);
    }
};

const  getDeciderWork = async () => {
    let response = await swf.pollForDecisionTask({
        domain: workflowDomain,
        taskList: {
            name: workflowTasklist
        },
        identity: deciderId
    }).promise();

    if(response.events != undefined) {
        await performDecisionTask(response);
    } else {
        console.log('nothing to decide');
    }
    
};

const doWork = async () => {
    for(;;) {
        await getDeciderWork();
    }
}

doWork();