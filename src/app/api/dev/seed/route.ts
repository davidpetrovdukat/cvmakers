import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const expected = process.env.SEED_SECRET;
    // If a secret is set, enforce it. If not set, allow seeding for convenience in dev.
    if (expected && secret !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passwordPlain = 'password123';
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    
    // Тестовый пользователь с указанными данными
    const testPasswordHash = await bcrypt.hash('test777!', 12);
    // Используем UTC дату для избежания проблем с часовыми поясами
    const testUserDateOfBirth = new Date('1990-01-22T00:00:00Z');
    
    const users = [
      { email: 'user-with-tokens@example.com', name: 'Test User (tokens)', tokenBalance: 100 },
      { email: 'user-without-tokens@example.com', name: 'Test User (no tokens)', tokenBalance: 0 },
      {
        email: 'cvr82447@outlook.com',
        name: 'Test User',
        tokenBalance: 1000000,
        password: testPasswordHash,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: testUserDateOfBirth,
        street: '31 Auctioneers Way',
        city: 'Northampton',
        country: 'United Kingdom',
        postalCode: 'NN1 1HF',
      },
    ];

    const results = [] as any[];
    for (const u of users) {
      try {
        const userData: any = {
          email: u.email.toLowerCase(),
          name: u.name,
          tokenBalance: u.tokenBalance,
          currency: 'GBP',
          password: u.password || passwordHash,
        };
        
        // Добавляем дополнительные поля для тестового пользователя
        if (u.firstName) {
          userData.firstName = u.firstName;
          userData.lastName = u.lastName;
          userData.dateOfBirth = u.dateOfBirth;
          userData.street = u.street;
          userData.city = u.city;
          userData.country = u.country;
          userData.postalCode = u.postalCode;
        }
        
        // Формируем объект обновления явно, чтобы избежать проблем с типами
        const updateData: any = {
          tokenBalance: u.tokenBalance,
          password: u.password || passwordHash,
        };
        
        // Добавляем дополнительные поля для обновления, если они есть
        if (u.firstName) {
          updateData.firstName = u.firstName;
          updateData.lastName = u.lastName;
          updateData.dateOfBirth = u.dateOfBirth;
          updateData.street = u.street;
          updateData.city = u.city;
          updateData.country = u.country;
          updateData.postalCode = u.postalCode;
        }
        
        const user = await prisma.user.upsert({
          where: { email: u.email.toLowerCase() },
          update: updateData,
          create: userData,
        });
        results.push({ id: user.id, email: user.email, tokenBalance: user.tokenBalance });
      } catch (userError: any) {
        console.error(`[SEED_ERROR] Failed to create/update user ${u.email}:`, userError);
        // Продолжаем обработку других пользователей даже если один упал
        results.push({ 
          email: u.email, 
          error: userError.message || 'Unknown error',
          tokenBalance: u.tokenBalance 
        });
      }
    }

    return NextResponse.json({ ok: true, users: results });
  } catch (error: any) {
    console.error('[SEED_ERROR] Fatal error in seed endpoint:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
