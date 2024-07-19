import { NextResponse } from "next/server";
import { connectMongoDb } from "../../../../lib/mongodb";
import UserSockInfo from "../../../../models/userStockInfo";

export async function POST(req) {
    try {
        const {email, aboveThreshold, belowThreshold} = await req.json()
        console.log(email, aboveThreshold, belowThreshold, `email, aboveThreshold, belowThreshold`)
            await connectMongoDb()
            await UserSockInfo.create({email, aboveThreshold, belowThreshold})
            return NextResponse.json({message: "Threshold Created Successfully"}, {status: 200})
        
    } catch (error) {
        return NextResponse.json(
            {message: "An error occured data cannot be send"},
            { status: 500}
        )
    }
}