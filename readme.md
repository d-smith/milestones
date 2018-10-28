# milestones

Milestone model using step functions

### SWF Notes

Set up:

* [Register domain](https://docs.aws.amazon.com/cli/latest/reference/swf/register-domain.html)
* [Register workflow type](https://docs.aws.amazon.com/cli/latest/reference/swf/register-workflow-type.html)
* [Register activity type](https://docs.aws.amazon.com/cli/latest/reference/swf/register-activity-type.html)

### Notes

* AWS - [CLI docs](https://docs.aws.amazon.com/cli/latest/reference/swf/index.html)
* Use 1.6.1 of the serverless plugin to avoid an error - IamRoleStateMachineExecution - Policy statement must contain resources. See [this](https://github.com/horike37/serverless-step-functions/issues/146) incident.