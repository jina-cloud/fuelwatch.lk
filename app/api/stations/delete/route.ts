import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Station from '@/models/Station';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId } = body;

    if (!stationId) {
      return NextResponse.json({ error: 'stationId is required' }, { status: 400 });
    }

    await dbConnect();

    const deleted = await Station.findByIdAndDelete(stationId);

    if (!deleted) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully.'
    });
  } catch (error) {
    console.error('POST /api/stations/delete error:', error);
    return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 });
  }
}
