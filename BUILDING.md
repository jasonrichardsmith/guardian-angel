# Building

Most of this demo is captured in Cloudformaton.  For those services that are not we will have to use the cli or the AWS console.

Due to dependencies within this system we will need to build the interconnected services in a particular order.

**Insure you have the correct region set!**

## Step 1

### Build out Amazon Connect instance

First you will want to access the Amazon Connect Console](https://console.aws.amazon.com/connect).

If you have already created an instance you can "Add an Instance", if you have not you will see the following screen, where you can click "Get Started".

![connect1](./images/connect1.png)


On the next page you will need to enter in a unique name for your instance.

![connect2](./images/connect2.png)


We can skip creating a new admin for this demo

![connect3](./images/connect3.png)


We will only be making outbound calls

![connect4](./images/connect4.png)

We can click next on the data storage page

![connect5](./images/connect5.png)


Finally we can create our instance.

![connect6](./images/connect6.png)

Click "Get Started" to access the Amazon connect console.

## Step 2

### Claim a number

Under the menu on the Amazon Connect Console click Routing -> Phone numbers

![connect8](./images/connect8.png)

Then click claim a number

![connect9](./images/connect9.png)

Choose you country code and pick a number from the available options and click save, no other fieslds are needed.

**Save this number!**

![connect10](./images/connect10.png)

## Step 3

### Build the contact a doctor contact flow

Under the menu on the Amazon Connect Console click Routing -> Contact Flows

![connect12](./images/connect12.png)

Press "Create a contact flow"

![connect13](./images/connect13.png)

This will provide an area where you can build the contact flow.  We will be importing one provided in this repository.

Click the "Import flow(beta)" in the dropdown menu next to "Save".

![connect14](./images/connect14.png)

Choose the file in this repository  

```bash
contactflows/calldoctor.json
```

This should import a flow chart that looks similair to this:

![connect15](./images/connect15.png)

**Save**

Click on "Show addition flow information"

![connect16](./images/connect16.png)

A drop down will appear with fields, we are only interested in the ARN field.  Copy that, it will be needed in the future.

We will need the components that make up the ARN not the entire arn itself. The fields we will need are:
- Amazon Connect Instance ID
- Contact flow ID

```bash
arn:aws:connect:us-east-1:123456789012:instance/{this is your instance id}/contact-flow/{this is your flow id}
```

**Copy and save these fields.**

## Step 4

### Deploy the lambda that will trigger the doctor contact flow

To deploy the lambda open the **calldoctor.json** file and enter the fields we saved earlier.

```json
[

  {
    "ParameterKey": "ConnectInstance",
    "ParameterValue": ""
  },
  {
    "ParameterKey": "ContactFlowId",
    "ParameterValue": ""
  },
  {
    "ParameterKey": "SourcePhoneNumber",
    "ParameterValue": ""
  }
]

```

Now we can deploy the lambda with the AWS CLI using cloudformation. (Update region if necessary)

```bash
aws cloudformation create-stack --template-body file://calldoctor.yaml \
	--capabilities CAPABILITY_IAM --stack-name guardianangel-doctor \
	--region us-east-1 --parameters file://calldoctor.json
```

When the stack is done deploying it provides an arn for the lambda it creates. We need to retrieve that arn

```bash
aws cloudformation describe-stack --stack-name guardianangel-doctor \
 --region us-east-1 \
 --query 'Stacks[0].Outputs[?OutputKey==`CallDoctorLambdaArn`].OutputValue' \
 --output text
```

**Save this ARN**

## Step 5

### Create the oLex Bot

You can deploy Lex Bot by running.
```bash
cd lex
./deploy.sh
```
If you are running in a different region than us-east-1 edit the file to reflect the region you are using, before running the script.

## Step 6

### Create the patient contact flow

Open the file
```bash
contactflows/callpatient.json
```
and replace "ADD CALL DOCTOR ARN HERE" with the arn we just saved from the Lambda.

Return to the Amazon Connect Console

Under the menu on the Amazon Connect Console click Routing -> Contact Flows

![connect12](./images/connect12.png)

Press "Create a contact flow"

![connect13](./images/connect13.png)

This will provide an area where you can build the contact flow.  We will be importing one provided in this repository.

Click the "Import flow(beta)" in the dropdown menu next to "Save".

![connect14](./images/connect14.png)

Choose the file
```bash
contactflows/callpatient.json
```
**Save**

Click on "Show addition flow information"

![connect16](./images/connect16.png)

The instance ID should be the same so we will just need the Contact flow ID

```bash
arn:aws:connect:us-east-1:123456789012:instance/{this is your instance id}/contact-flow/{this is your flow id}
```

**Copy and save these fields.**

## Step 7
 
### Deploy the remaining stack
 
To deploy the remaining stack open the **stack.json** file and enter the fields we saved earlier.  We are using the call patient flow from Step 6!


Now we can deploy the stack (Update region if necessary)

```bash
aws cloudformation create-stack --template-body file://stack.yaml \
	--capabilities CAPABILITY_IAM --stack-name guardianangel-stack \
	--region us-east-1 --parameters file://stack.json
```


