# Guardian Angel Demo

A demo designed to demonstrate how to bring together disparate AWS services to rapidly develop highly scalable applications.

The demo is based on a fake application that you run on your phone that pairs with a wearable device and sends some physical telemetry data.

Since there is no device, we will simulate changing telemetry data with an app on the phone that can adjust the data level with a slider.

This app then sends the data to AWS.

If telemetry data goes through rapid fluctuation, the patient will be called and asked about their health.  If the patient does not answer that they are "OK" or does not respond, a Doctor will be called and told of health problems with the patient.

# Components

## Services
The demo is constructed using the following services:

- Amazon Connect
- AWS Lex
- IoTCore
- Cognito
- KinesisFirehose
- KinesisAnalytics
- Lambda
- S3

## SDKs
And the following SDKs

- Boto3
- Amplify
- AWS SDK (NodeJS)
- Expo
- ReactNative

# Regions

For the full demo to work we are restricted to the following  regions

- US East (N. Virginia)
- US West (Oregon)


