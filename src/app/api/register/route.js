import { NextResponse } from "next/server";
import { connectMongoDb } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        const {name, email, password} = await req.json()
        const hashedPassword = await bcrypt.hash(password, 10);

        await connectMongoDb();
        await User.create({name, email, password:hashedPassword});
        return NextResponse.json({message: "User Registered"}, {status: 200});

    } catch (error) {
        return NextResponse.json(
        {message: "An Error Occured User Didn't Registered"},
        {status: 500}
    )
    }
}