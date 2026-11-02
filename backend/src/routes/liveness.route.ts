import type { Request, Response } from 'express';

/**
 * Liveness response for container probes.
 */
export function livenessHandler(_req: Request, res: Response): void {
  res.status(200).json({ status: 'OK' });
}
