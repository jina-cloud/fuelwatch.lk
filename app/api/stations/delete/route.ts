import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'stations.json');

async function getStationsData() {
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId } = body;

    if (!stationId) {
      return NextResponse.json({ error: 'stationId is required' }, { status: 400 });
    }

    let stations = await getStationsData();
    const initialLength = stations.length;
    
    // Remove the station with the matching ID
    stations = stations.filter((s: any) => s.id !== stationId);

    if (stations.length === initialLength) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(stations, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 });
  }
}
