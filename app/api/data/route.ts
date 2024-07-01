// app/api/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

interface MyDocument {
  _id: string;
  title: string;
  description: string;
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DATABASE_NAME);
    const collection = db.collection<MyDocument>('your_collection_name');
    const result = await collection.find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
