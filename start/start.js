
const stateMachineArn = process.env.STATE_MACHINE_ARN;


module.exports.handler = async (event, context) => {
    console.log(`state machine arn: ${stateMachineArn}`);
    return 'ok';
}