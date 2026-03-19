import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the JSON file
const dataFilePath = path.join(process.cwd(), 'data', 'stations.json');

async function getStationsData() {
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const city = searchParams.get('city');
  const fuel = searchParams.get('fuel');
  const brand = searchParams.get('brand');
  const status = searchParams.get('status');

  try {
    let stations = await getStationsData();

    if (district && district !== 'all') {
      stations = stations.filter((s: any) => s.district?.toLowerCase() === district.toLowerCase());
    }
    if (city && city !== 'all') {
      stations = stations.filter((s: any) => s.city.toLowerCase() === city.toLowerCase());
    }
    if (fuel && fuel !== 'all') {
      stations = stations.filter((s: any) =>
        s.fuelTypes.some((f: any) => f.type.toLowerCase() === fuel.toLowerCase())
      );
    }
    if (brand && brand !== 'all') {
      stations = stations.filter((s: any) => s.brand.toLowerCase() === brand.toLowerCase());
    }
    if (status && status !== 'all') {
      stations = stations.filter((s: any) =>
        s.fuelTypes.some((f: any) => f.status === status)
      );
    }

    return NextResponse.json({
      stations,
      total: stations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stations data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId, fuelType, availability } = body;

    if (!stationId || !fuelType || !availability) {
      return NextResponse.json(
        { error: 'stationId, fuelType, and availability are required' },
        { status: 400 }
      );
    }

    const stations = await getStationsData();
    const stationIndex = stations.findIndex((s: any) => s.id === stationId);

    if (stationIndex === -1) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    const station = stations[stationIndex];
    const fuelIndex = station.fuelTypes.findIndex((f: any) => f.type === fuelType);

    if (fuelIndex === -1) {
      return NextResponse.json({ error: 'Fuel type not found for this station' }, { status: 404 });
    }

    // Update fuel status
    station.fuelTypes[fuelIndex].status = availability;
    station.lastUpdated = new Date().toISOString();
    station.reportCount += 1;

    // Write back to file
    await fs.writeFile(dataFilePath, JSON.stringify(stations, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Station updated.',
      station,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}
