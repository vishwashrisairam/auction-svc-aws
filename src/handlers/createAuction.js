const uuid = require('uuid')
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const createError = require('http-errors');
import validator from '@middy/validator'
import createAuctionSchema from '../lib/schema/createAuctionSchema'

import commonMiddleware from '../lib/commonMiddleware'


const createAuction = async (event, context) => {
  const {title} = event.body
  const {email} = event.requestContext.authorizer
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours()+1)

  const auction = {
    id : uuid.v4(),
    title,
    status : 'OPEN',
    createdAt : now.toISOString(),
    endingAt:endDate.toISOString(), 
    highestBid : {
      amount : 0 
    },
    seller : email,
  }
  try{
    await dynamodb.put({
      TableName : process.env.AUCTIONS_TABLE_NAME,
      Item : auction
    }).promise(); 
  }catch(error){
    console.error(error)
    throw new createError.InternalServerError(error)
  }
  

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}


exports.handler = commonMiddleware(createAuction)
  .use(validator({inputSchema :createAuctionSchema}))



 
