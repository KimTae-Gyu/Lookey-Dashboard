const AWS = require('aws-sdk');
require('dotenv').config();

function awsSet() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const credentials = new AWS.Credentials({ accessKeyId, secretAccessKey });
    AWS.config.credentials = credentials;
    AWS.config.update({ region: process.env.AWS_REGION });

    return AWS;
}

async function invokeLambda() {
    const AWS = awsSet();
    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: 'NFW_Control',
        //Payload: JSON.stringify(payload)
    };

    try {
        const response = await lambda.invoke(params).promise();
        console.log(response);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// async function invokeLambda(payload) {
//     const AWS = awsSet();
//     const lambda = new AWS.Lambda();
//     const params = {
//         FunctionName: 'NFW_Control',
//         Payload: JSON.stringify(payload)
//     };

//     try {
//         const response = await lambda.invoke(params).promise();
//         console.log(response);
//         return true;
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// }

module.exports = invokeLambda;