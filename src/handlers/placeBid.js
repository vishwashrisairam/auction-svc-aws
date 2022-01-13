const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const createError = require('http-errors');

import validator from '@middy/validator'
import commonMiddleware from '../lib/commonMiddleware'
import placeBidSchema from '../lib/schema/placeBidSchema'
import {getAuctionById} from './getAuction'


const placeBid = async (event, context) => {
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const {email} = event.requestContext.authorizer

    const auction = await getAuctionById(id)

    if(email === auction.seller){
        throw new createError.Forbidden('You cannot bid on your own autctions')
    }

    if(email === auction.highestBid.bidder){
        throw new createError.Forbidden('You are already the highest bidder')
    }

    if(auction.status !=='OPEN'){
        throw new createError.Forbidden(`You cannot bid on closed auctions `)
    }
    if(amount <= auction.highestBid.amount){
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`)
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email
        },
        ReturnValues: 'ALL_NEW'
    };

    let updatedAuction
    try {
        const result = await dynamodb.update(params).promise()
        updatedAuction = result.Attributes;
    } catch (error) {
        console.error(error)
        throw new createError.InternalServerError(error)
    }


    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

exports.handler = commonMiddleware(placeBid)
    .use(validator({inputSchema :placeBidSchema}))
