import bcrypt from "bcryptjs";

//I set the salt to 12 rounds because its a good comprimise between security and actually being able to login in at a reasonable pace
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
