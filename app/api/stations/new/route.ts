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
    const { name, brand, city, district, address, lat, lng, fuelTypes } = body;

    if (!name || !brand || !city || !district || !address || !lat || !lng || !fuelTypes) {
      return NextResponse.json(
        { error: 'All fields are required to add a new station' },
        { status: 400 }
      );
    }

    const stations = await getStationsData();
    
    // Generate simple ID (for standard use cases, UUID is better, but this works for demo)
    const maxId = stations.reduce((max: number, s: any) => Math.max(max, parseInt(s.id)), 0);
    const newId = (maxId + 1).toString();

    const newStation = {
      id: newId,
      name,
      brand,
      city,
      district,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone: "N/A", // Default phone
      lastUpdated: new Date().toISOString(),
      reportCount: 0,
      fuelTypes
    };

    stations.push(newStation);

    await fs.writeFile(dataFilePath, JSON.stringify(stations, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Station added successfully.',
      station: newStation
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add station' }, { status: 500 });
  }
}
