import { db } from '@/db/drizzle';
import { users, travelers, guides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function createUser(data: {
  email: string;
  password: string;
  phone: string;
  name: string;
  role: 'TRAVELER' | 'GUIDE' | 'ADMIN';
  birthYear: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  languages: string[];
  country?: string;
  nic?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  // Create user with all fields
  const [user] = await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    name: data.name,
    role: data.role,
    birthYear: data.birthYear,
    gender: data.gender,
    languages: data.languages,
  }).returning();

  // Create traveler record if role is TRAVELER
  if (data.role === 'TRAVELER' && data.country) {
    await db.insert(travelers).values({
      userId: user.id,
      country: data.country,
    });
  }

  // Create guide record if role is GUIDE
  if (data.role === 'GUIDE' && data.nic && data.country) {
    await db.insert(guides).values({
      userId: user.id,
      nic: data.nic,
    });
  }

  return user;
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function getUserWithRole(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) return null;

  let roleData = null;

  if (user.role === 'TRAVELER') {
    const [traveler] = await db.select().from(travelers).where(eq(travelers.userId, userId));
    roleData = traveler;
  } else if (user.role === 'GUIDE') {
    const [guide] = await db.select().from(guides).where(eq(guides.userId, userId));
    roleData = guide;
  }

  return {
    ...user,
    roleData,
  };
}