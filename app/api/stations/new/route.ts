import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Station from '@/models/Station';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, city, district, address, lat, lng, fuelTypes } = body;

    if (!name || !brand || !city || !district || !address || !lat || !lng || !fuelTypes) {
      return NextResponse.json({ error: 'Missing required station details' }, { status: 400 });
    }

    await dbConnect();

    const newStation = await Station.create({
      name,
      brand,
      city,
      district,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      fuelTypes
    });

    return NextResponse.json({
      success: true,
      message: 'Station added successfully',
      station: newStation
    });
  } catch (error) {
    console.error('POST /api/stations/new error:', error);
    return NextResponse.json({ error: 'Failed to add station' }, { status: 500 });
  }
}
