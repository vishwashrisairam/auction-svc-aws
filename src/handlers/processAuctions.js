import createError from 'http-errors'
import { getEndedAuctions } from "../lib/getEndedAuctions"
import { closeAuction } from "../lib/closeAuction"

const processAuctions = async (event,context) =>{
    try{
        const auctionsToClose = await getEndedAuctions();
        const closedPromises = auctionsToClose.map(auction=>closeAuction(auction))
        await Promise.all(closedPromises) 

        return {closed:closedPromises.length}
    }catch(error){
        console.error(error)
        throw new createError.InternalServerError(error)
    }

}

exports.handler = processAuctions