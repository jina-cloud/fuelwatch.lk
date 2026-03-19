import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Station from '@/models/Station';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if we already have data
    const existingCount = await Station.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ message: `Database already has ${existingCount} stations. Seed skipped.` });
    }

    const dataFilePath = path.join(process.cwd(), 'data', 'stations.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const stationsData = JSON.parse(fileContents);

    // Remove local IDs so Mongo assigns _id automatically
    const seedData = stationsData.map((s: any) => {
      const { id, ...rest } = s;
      return rest;
    });

    const result = await Station.insertMany(seedData);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.length} stations directly from local JSON into MongoDB Atlas!`,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: error.message }, { status: 500 });
  }
}
