const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const createError = require('http-errors');

import commonMiddleware from '../lib/commonMiddleware';


export async function getAuctionById(id){
  let auction; 
  try{
    const result = await dynamodb.get({
      TableName : process.env.AUCTIONS_TABLE_NAME,
      Key : {id}
    }).promise(); 
    auction = result.Item;
  }catch(error){
    console.error(error)
    throw new createError.InternalServerError(error)
  }
  if(!auction){
    throw new createError.NotFound(`Auction wiht ID "${id}" not found`)
  }
  return auction;

}


const getAuction = async (event, context) => {
  let auction;
  const {id} = event.pathParameters; 

  auction = await getAuctionById(id)
  
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

exports.handler = commonMiddleware(getAuction)