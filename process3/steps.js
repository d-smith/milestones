const AWS = require('aws-sdk');
const swf = new AWS.SWF();

const workflowDomain = process.env.WORKFLOW_DOMAIN;



const step3 = async (event, context) => {

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
    step3
};