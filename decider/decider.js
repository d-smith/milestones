const stateMachineArn = process.env.STATE_MACHINE_ARN;
const workflowDomain = process.env.WORKFLOW_DOMAIN;
const workflowType = process.env.WORKFLOW_TYPE;
const workflowVersion = process.env.WORKFLOW_VERSION;
const workflowTasklist = process.env.WORKFLOW_TASKLIST;

const AWS = require('aws-sdk');
const swf = new AWS.SWF();
const stepfn = new AWS.StepFunctions();
const _ = require('lodash');

const makeid = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

const deciderId=makeid();

const firstActivityShouldBeScheduled = async (events) => {
    let filtered = _.filter(events, (o) => { return o.eventType != 'DecisionTaskStarted'
                         && o.eventType != 'DecisionTaskScheduled'
                        && o.eventType != 'DecisionTaskTimedOut' });
    return filtered.length == 1;
}

const getExecutionId = (task) => {
    return task.workflowExecution.workflowId;
};

const scheduleFirstActivity = async (task) => {
    console.log('schedule activity 1');
    return await swf.respondDecisionTaskCompleted({
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
                    scheduleToCloseTimeout: `${7 * 24 * 60 * 60}`,
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
    
};

const startStepFunctionOrchestration = async (task) => {
    let workflowId = getExecutionId(task);
    console.log('start step function with execution id', workflowId);
    
    return await stepfn.startExecution({
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({workflowId: workflowId})
    }).promise();
}

const performDecisionTask = async (task) => {
    console.log(JSON.stringify(task));
    console.log('schedule first activity?')
    if(firstActivityShouldBeScheduled(task.events)) {
        let response = await scheduleFirstActivity(task);
        console.log(`schedule activity 1 returns ${JSON.stringify(response)}`);
    }
};

const  getDeciderWork = async () => {
    console.log('poll for decision...');
    let response = await swf.pollForDecisionTask({
        domain: workflowDomain,
        taskList: {
            name: workflowTasklist
        },
        identity: deciderId
    }).promise();

    if(response.events == undefined) {
        console.log('nothing to decide');
        return;
    }

    await Promise.all([performDecisionTask(response), startStepFunctionOrchestration(response)])
                    .then((results) => {
                        console.log('startResult', results[1]);
                    });
};

const doWork = async () => {
    for(;;) {
        await getDeciderWork();
    }
}

doWork();