import { NextResponse } from 'next/server';

/**
 * Liveness response for container probes.
 */
export const GET = () => {
  return NextResponse.json({ status: 'OK' }, { status: 200 });
};
