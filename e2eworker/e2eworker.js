const AWS = require('aws-sdk');

var stepfunctions = new AWS.StepFunctions();
const makeid = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

const hasData = (o) => {
    return Object.keys(o).length > 0;
};

const startProcess1 = async () => {
    
    const workerName = 'worker-' + makeid();

    let params = {
        activityArn: process.env.PROCESS1_ARN,
        workerName: workerName
    };

    console.log('await activity 1');
    let activityData = await stepfunctions.getActivityTask(params).promise();
    console.log('activityData', activityData);
    if(!hasData(activityData)) {
        console.log('no data to process');
        return;
    }

    let taskToken = activityData['taskToken'];

    let startExeParams = {
        stateMachineArn: process.env.PROCESS1_SM,
        input: JSON.stringify({taskToken: taskToken})
    };

    let response = await stepfunctions.startExecution(startExeParams).promise();
    console.log(response)
}

const process1StartHandler = async () => {
    for(;;) {
        await startProcess1();
    }
} 

const doWork = async () => {
    process1StartHandler();
}

doWork();