# milestones

Milestone model using step functions

## SWF Set Up

For this example, we are using SWF as a 'shadow' model of a larger process that is implemented by separate step function state machines.

In the context of the demo, we can create the workflow domain, type, and activities.

Register a domain


```console
aws swf register-domain --name e2e --workflow-execution-retention-period-in-days 7
```

Register a workflow type in the domain:

```console
aws swf register-workflow-type --domain e2e --name "Milestone Flow 1" --workflow-version "v1"
```

Register our milestones as activities

```console
aws swf register-activity-type --domain e2e --name milestone1 --activity-version 1
aws swf register-activity-type --domain e2e --name milestone2 --activity-version 1
aws swf register-activity-type --domain e2e --name milestone3 --activity-version 1
```


## Notes

### General

Plan:

1. serverless API to initiate the process
    * start workflow execution
    * poll for activity task
    * in activity, start a step function execution
    * last step of execution - signal

    
### SWF Notes

Set up:

* [Register domain](https://docs.aws.amazon.com/cli/latest/reference/swf/register-domain.html)
* [Register workflow type](https://docs.aws.amazon.com/cli/latest/reference/swf/register-workflow-type.html)
* [Register activity type](https://docs.aws.amazon.com/cli/latest/reference/swf/register-activity-type.html)

### Notes

* AWS - [CLI docs](https://docs.aws.amazon.com/cli/latest/reference/swf/index.html)
* Use 1.6.1 of the serverless plugin to avoid an error - IamRoleStateMachineExecution - Policy statement must contain resources. See [this](https://github.com/horike37/serverless-step-functions/issues/146) incident.