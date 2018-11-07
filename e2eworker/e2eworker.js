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



const startProcessForActivity = async (workerName, activityArn, stateMachineArn) => {
    let params = {
        activityArn: activityArn,
        workerName: workerName
    };

    console.log(workerName, 'await activity');
    let activityData = await stepfunctions.getActivityTask(params).promise();
    console.log('activityData', activityData);
    if (!hasData(activityData)) {
        console.log('no data to process');
        return;
    }

    let taskToken = activityData['taskToken'];

    let startExeParams = {
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({ taskToken: taskToken })
    };

    let response = await stepfunctions.startExecution(startExeParams).promise();
    console.log(response)
}



const process1StartHandler = async () => {
    const worker1Name = 'worker1-' + makeid();
    for (; ;) {
        await startProcessForActivity(worker1Name, process.env.PROCESS1_ARN, process.env.PROCESS1_SM);
    }
}

const process2StartHandler = async () => {
    const worker2Name = 'worker2-' + makeid();
    for (; ;) {
        await startProcessForActivity(worker2Name, process.env.PROCESS2_ARN, process.env.PROCESS2_SM);
    }
}

const process3StartHandler = async () => {
    const worker3Name = 'worker3-' + makeid();
    for (; ;) {
        await startProcessForActivity(worker3Name, process.env.PROCESS3_ARN, process.env.PROCESS3_SM);
    }
}

const doWork = async () => {
    process1StartHandler();
    process2StartHandler();
    process3StartHandler();
}

doWork();