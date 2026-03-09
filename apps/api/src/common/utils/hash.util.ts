import * as bcrypt from 'bcrypt';

// 12 rounds ≈ ~250ms per hash — brute force-ийн эсрэг хангалттай хүчтэй
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
