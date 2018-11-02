
const stateMachineArn = process.env.STATE_MACHINE_ARN;
const workflowDomain = process.env.WORKFLOW_DOMAIN;
const workflowType = process.env.WORKFLOW_TYPE;
const workflowVersion = process.env.WORKFLOW_VERSION;

const AWS = require('aws-sdk');
const swf = new AWS.SWF();

const chance = require('chance').Chance();

module.exports.handler = async (event, context) => {

    let id = chance.guid();
    let response = await swf.startWorkflowExecution(
        {
            domain: workflowDomain,
            workflowId: id,
            workflowType: {
                name: workflowType,
                version: workflowVersion
            },
            childPolicy: 'REQUEST_CANCEL',
            taskList: {
                name: 'msflow'
            },
            input: '',
            taskStartToCloseTimeout: 'NONE',
            executionStartToCloseTimeout: `${60 * 60 * 24 * 180}` //180 days in seconds
        }
    ).promise();

    console.log(JSON.stringify(response));

    console.log(`state machine arn: ${stateMachineArn}`);
    return 'ok';
}