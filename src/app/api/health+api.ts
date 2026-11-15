/**
 * Health check API route
 * GET /api/health
 *
 * Returns server health status. Useful for monitoring and load balancers.
 */
export function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
  });
}
