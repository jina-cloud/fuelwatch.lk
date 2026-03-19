import { NextRequest, NextResponse } from 'next/server';
import type { UserReport } from '@/types/station';

// In-memory store (Phase 1 — replace with DB in Phase 2)
// Seeded with realistic example reports so the UI has data to display
const reportsStore: UserReport[] = [
  {
    id: 'r-001', stationId: '1', fuelType: '92 Octane', availability: 'available',
    queueLength: 'short', comment: 'Queue moving fast, around 10 vehicles.', upvotes: 8, downvotes: 1,
    submittedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), isGeoverified: true,
  },
  {
    id: 'r-002', stationId: '1', fuelType: 'Diesel', availability: 'available',
    queueLength: 'medium', comment: '40+ vehicles but moving steadily.', upvotes: 5, downvotes: 0,
    submittedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), isGeoverified: false,
  },
  {
    id: 'r-003', stationId: '4', fuelType: '95 Octane', availability: 'available',
    queueLength: 'short', comment: 'No queue at all right now!', upvotes: 12, downvotes: 0,
    submittedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), isGeoverified: true,
  },
  {
    id: 'r-004', stationId: '7', fuelType: '92 Octane', availability: 'unavailable',
    queueLength: 'none', comment: 'Staff confirmed no stock until tomorrow morning.', upvotes: 15, downvotes: 2,
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), isGeoverified: true,
  },
  {
    id: 'r-005', stationId: '5', fuelType: 'Diesel', availability: 'limited',
    queueLength: 'long', comment: 'Running critically low, row stretches to main road.', upvotes: 9, downvotes: 1,
    submittedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), isGeoverified: false,
  },
  {
    id: 'r-006', stationId: '16', fuelType: 'Super Diesel', availability: 'available',
    queueLength: 'short', comment: 'All types available, ~5 min wait.', upvotes: 6, downvotes: 0,
    submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), isGeoverified: true,
  },
  {
    id: 'r-007', stationId: '2', fuelType: '92 Octane', availability: 'available',
    queueLength: 'medium', comment: 'About 30 min wait but stock is good.', upvotes: 4, downvotes: 0,
    submittedAt: new Date(Date.now() - 33 * 60 * 1000).toISOString(), isGeoverified: false,
  },
];

/** GET /api/reports?stationId=X — returns reports for a station */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');

  let reports = [...reportsStore];
  if (stationId) {
    reports = reports.filter(r => r.stationId === stationId);
  }

  // Sort newest first
  reports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return NextResponse.json({ reports, total: reports.length });
}

/** POST /api/reports — submit a new report */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { stationId, fuelType, availability, queueLength, comment, isGeoverified } = body;

  if (!stationId || !fuelType || !availability || !queueLength) {
    return NextResponse.json(
      { error: 'stationId, fuelType, availability, and queueLength are required' },
      { status: 400 }
    );
  }

  const newReport: UserReport = {
    id: `r-${Date.now()}`,
    stationId,
    fuelType,
    availability,
    queueLength,
    comment: comment || '',
    submittedAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    isGeoverified: Boolean(isGeoverified),
  };

  reportsStore.unshift(newReport);

  return NextResponse.json({ success: true, report: newReport });
}

/** PATCH /api/reports — upvote or downvote a report */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { reportId, vote } = body; // vote: 'up' | 'down'

  if (!reportId || !['up', 'down'].includes(vote)) {
    return NextResponse.json({ error: 'reportId and vote (up|down) required' }, { status: 400 });
  }

  const report = reportsStore.find(r => r.id === reportId);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (vote === 'up') report.upvotes += 1;
  else report.downvotes += 1;

  return NextResponse.json({ success: true, report });
}
