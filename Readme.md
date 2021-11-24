# PG&E MRAD Node.js Coding Challenge

Building a Restful API to parse, transform and upload data to S3.

## Implementation Details
   
The code exposes 2 endpoints once launched:
1. A GET at `/heartbeat` to check the server's connection
2. A POST at `/` that calls the application code to parse, transform and upload data to S3.
 - Optionally, you can post json data for `writeToS3 {boolean}` to write the file to S3 and `fileName {string}` to specify a file name.   
    
 **Note**   
The writeToS3 data is not supported for Docker based testing.


## Testing:

### Running Locally   
The application uses the Hapi server to provide a REST Api. To run the application, after cloning the code from Github take the following steps.
   

**Notes**   
- The Node application requires Node version 14 or greater.   
- In order for the Server to upload to an S3 bucket, please be sure to provide the Access Key and Secret Access key credentials that have access to GetBucket, CreateBucket, PutObject at the very least.    
   
```
export AWS_ACCESS_KEY_ID='{your key here}'
export AWS_SECRET_ACCESS_KEY='{your key here}'
```

1. Navigate to the src folder.
2. Create a `.env` file with the following contents

```
REGION='us-east-2'
BUCKET_NAME='pg-e-nathan-cc'
FILE_NAME='filtered-Stations.csv'
```
3. From a terminal run `npm start`

   

### Running Via Docker
   
1. Navigate to the `src` folder from the terminal.
2. Run the command `docker build . -t {your docker image tag}`
3. Once the image is built, run the image with `docker run --rm —e AWS_ACCESS_KEY_ID='{your access key for a priviledged account}' -e AWS_SECRET_ACCESS_KEY='{your secret access key for a priviledged account}' -p 8080:8080 {your docker image tag from the last step}`
   
   
### Deploying the app up to AWS
The code also provides a way to upload the Application to AWS via the use of AWS SAM. To use AWS SAM, please review the details below:

- [Instructions to Install AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Instructions to Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   
   
1. From the root folder, to test the application, run the following command
`sam local invoke APIFunction -e src/tests/event.json`
2. Once you are ready to push the application up to AWS, run the following command and follow the onscreen prompt to create a CloudFormation stack and have AWS automatically create the application and necessary components for you
`sam deploy --guided`


