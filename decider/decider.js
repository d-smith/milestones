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

const firstActivityShouldBeScheduled =  (events) => {

    let reduced = _.reduce(events, function(acc, o) { 

        switch(o.eventType) {
            case 'WorkflowExecutionStarted':
            case 'DecisionTaskStarted':
            case 'DecisionTaskScheduled':
            case 'DecisionTaskTimedOut':
                break;
            default:
                acc.push(o);
        }

        return acc;
    }, []);

    return reduced.length == 0;
}

const getExecutionId = (task) => {
    return task.workflowExecution.workflowId;
};

const getRunId = (task) => {
    return task.workflowExecution.runId;
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
    let runId = getRunId(task);
    console.log('start step function with wf id and run id', workflowId, ' - ', runId);
    
    return await stepfn.startExecution({
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({workflowId: workflowId, runId: runId})
    }).promise();
}

const performDecisionTask = async (task) => {
    console.log(JSON.stringify(task));
    console.log('schedule first activity?')

    let createActivity1 = firstActivityShouldBeScheduled(task.events);
    console.log('createActivity1', createActivity1);

    if(createActivity1 == false) {
        console.log('no activity to schedule');
        return;
    }

    let response = await scheduleFirstActivity(task);
    console.log(`schedule activity 1 returns ${JSON.stringify(response)}`);
    let startResponse = await startStepFunctionOrchestration(task);
    console.log('startResponse', JSON.stringify(startResponse));
    
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

    await performDecisionTask(response);

//    await Promise.all([performDecisionTask(response), startStepFunctionOrchestration(response)])
//                    .then((results) => {
//                        console.log('startResult', results[1]);
//                    });
};

const doWork = async () => {
    for(;;) {
        await getDeciderWork();
    }
}

doWork();