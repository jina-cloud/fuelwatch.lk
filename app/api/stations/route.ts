import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Station from '@/models/Station';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const city = searchParams.get('city');
  const fuel = searchParams.get('fuel');
  const brand = searchParams.get('brand');
  const status = searchParams.get('status');

  try {
    await dbConnect();

    const query: any = {};
    if (district && district !== 'all') query.district = new RegExp(`^${district}$`, 'i');
    if (city && city !== 'all') query.city = new RegExp(`^${city}$`, 'i');
    if (brand && brand !== 'all') query.brand = new RegExp(`^${brand}$`, 'i');
    
    if (fuel && fuel !== 'all' && status && status !== 'all') {
      query.fuelTypes = { $elemMatch: { type: new RegExp(`^${fuel}$`, 'i'), status: status } };
    } else if (fuel && fuel !== 'all') {
      query.fuelTypes = { $elemMatch: { type: new RegExp(`^${fuel}$`, 'i') } };
    } else if (status && status !== 'all') {
      query.fuelTypes = { $elemMatch: { status: status } };
    }

    const stationsDocument = await Station.find(query).sort('-lastUpdated').lean();

    return NextResponse.json({
      stations: stationsDocument,
      total: stationsDocument.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/stations error:', error);
    return NextResponse.json({ error: 'Failed to access database. Check MONGODB_URI.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId, fuelType, availability } = body;

    if (!stationId || !fuelType || !availability) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const station = await Station.findOneAndUpdate(
      { _id: stationId, 'fuelTypes.type': fuelType },
      { 
        $set: { 
          'fuelTypes.$.status': availability,
          lastUpdated: new Date()
        },
        $inc: { reportCount: 1 }
      },
      { new: true }
    );

    if (!station) {
      return NextResponse.json({ error: 'Station or Fuel type not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully.',
      station,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/stations error:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}
