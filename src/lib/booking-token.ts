import crypto from "crypto";

const SECRET = process.env.BOOKING_TOKEN_SECRET || process.env.STRIPE_SECRET_KEY || "fallback-secret";

export function generateBookingToken(email: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(email.toLowerCase().trim())
    .digest("hex")
    .substring(0, 24);
}

export function verifyBookingToken(email: string, token: string): boolean {
  return generateBookingToken(email) === token;
}
