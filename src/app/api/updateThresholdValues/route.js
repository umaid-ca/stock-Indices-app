
import { connectMongoDb } from "../../../../lib/mongodb";
import { NextResponse } from "next/server";
import UserSockInfo from "../../../../models/userStockInfo";

export async function POST(req) {
  try {
    await connectMongoDb();
    
    const { email, aboveThreshold, belowThreshold } = await req.json();
    
    const updatedUser = await UserSockInfo.findOneAndUpdate(
      { email },
      { 
        aboveThreshold,
        belowThreshold 
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({ updatedUser });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}