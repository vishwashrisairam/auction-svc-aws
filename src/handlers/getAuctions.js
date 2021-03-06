const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();

const createError = require('http-errors');
import validator from '@middy/validator'
import getAuctionsSchema from '../lib/schema/getAuctionsSchema'
import commonMiddleware from '../lib/commonMiddleware'


const getAuctions = async (event, context) => {
    const {status} = event.queryStringParameters;
    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName : 'statusAndEndDate',
        KeyConditionExpression : '#status = :status',
        ExpressionAttributeValues : {
            ':status' :status
        },
        ExpressionAttributeNames : {
            '#status' :'status',
        }

    };

    try{
        const result = await dynamodb.query(params).promise(); 
        auctions = result.Items;    
    }catch(error){
      console.error(error)
      throw new createError.InternalServerError(error)
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
}

exports.handler = commonMiddleware(getAuctions)
    .use(validator({inputSchema:getAuctionsSchema, useDefaults:true}))