const AWS = require('aws-sdk');
const swf = new AWS.SWF();

const workflowDomain = process.env.WORKFLOW_DOMAIN;

const step1 = async (event, content) => {
    if(event['workflowId'] != undefined) {
        let wfid = event['workflowId'];
        let runId = event['runId'];

        console.log('signal execution in domain ', workflowDomain);

        let response = await swf.signalWorkflowExecution({
            domain: workflowDomain,
            signalName: 'Process One Started',
            workflowId: wfid,
            input: 'some input for history',
            runId: runId
        }).promise();

        console.log('signal response', JSON.stringify(response));
    }

    return 'ok'
}

const step3 = async (event, context) => {
    if(event['workflowId'] != undefined) {
        let wfid = event['workflowId'];
        let runId = event['runId'];

        console.log('signal execution in domain ', workflowDomain);

        let response = await swf.signalWorkflowExecution({
            domain: workflowDomain,
            signalName: 'Process One Finshed',
            workflowId: wfid,
            input: 'data related to the step function and signal',
            runId: runId
        }).promise();

        console.log('signal response', JSON.stringify(response));
        return 'ok';
    }

    if(event['taskToken'] != undefined) {
        const stepfunctions = new AWS.StepFunctions();

        let sendSuccess = await stepfunctions.sendTaskSuccess(
            {
                output: JSON.stringify('process 1 output'),
                taskToken: event['taskToken']
            }
        ).promise();
        console.log('sendSuccess returned', sendSuccess);
        return 'ok';
    }

    return 'ok i guess';
};



module.exports = {
    step1,
    step3
};