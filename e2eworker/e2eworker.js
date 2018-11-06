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

const worker1Name = 'worker1-' + makeid();
const worker2Name = 'worker2-' + makeid();
const worker3Name = 'worker3-' + makeid();

const startProcess1 = async () => {
    
    

    let params = {
        activityArn: process.env.PROCESS1_ARN,
        workerName: worker1Name
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


const startProcess2 = async () => {
    

    let params = {
        activityArn: process.env.PROCESS2_ARN,
        workerName: worker2Name
    };

    console.log('await activity 2');
    let activityData = await stepfunctions.getActivityTask(params).promise();
    console.log('activityData', activityData);
    if(!hasData(activityData)) {
        console.log('no data to process');
        return;
    }

    let taskToken = activityData['taskToken'];

    let startExeParams = {
        stateMachineArn: process.env.PROCESS2_SM,
        input: JSON.stringify({taskToken: taskToken})
    };

    let response = await stepfunctions.startExecution(startExeParams).promise();
    console.log(response)
}


const startProcess3 = async () => {
    

    let params = {
        activityArn: process.env.PROCESS3_ARN,
        workerName: worker3Name
    };

    console.log('await activity 3');
    let activityData = await stepfunctions.getActivityTask(params).promise();
    console.log('activityData', activityData);
    if(!hasData(activityData)) {
        console.log('no data to process');
        return;
    }

    let taskToken = activityData['taskToken'];

    let startExeParams = {
        stateMachineArn: process.env.PROCESS3_SM,
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

const process2StartHandler = async () => {
    for(;;) {
        await startProcess2();
    }
} 

const process3StartHandler = async () => {
    for(;;) {
        await startProcess3();
    }
} 

const doWork = async () => {
    process1StartHandler();
    process2StartHandler();
    process3StartHandler();
}

doWork();