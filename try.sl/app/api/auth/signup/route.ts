import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/auth_service';
import { createToken, setSession } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      phone, 
      name, 
      role, 
      birthYear,
      gender,
      languages,
      country, 
      nic 
    } = body;

    // Basic validation
    if (!email || !password || !phone || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, phone, name' },
        { status: 400 }
      );
    }

    // New fields validation
    if (!birthYear || !gender || !languages || languages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: birthYear, gender, languages' },
        { status: 400 }
      );
    }

    // Validate birth year
    const currentYear = new Date().getFullYear();
    if (birthYear < currentYear - 120 || birthYear > currentYear - 18) {
      return NextResponse.json(
        { error: 'Invalid birth year. Must be between 18 and 120 years old' },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Validate languages array
    if (!Array.isArray(languages) || languages.length === 0) {
      return NextResponse.json(
        { error: 'At least one language is required' },
        { status: 400 }
      );
    }

    // Admin email validation
    if (email.endsWith('@trysl.com')) {
      if (role !== 'ADMIN') {
        return NextResponse.json(
          { error: '@trysl.com emails can only register as ADMIN' },
          { status: 400 }
        );
      }
    } else if (role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts must use @trysl.com email' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === 'TRAVELER' && !country) {
      return NextResponse.json(
        { error: 'Country is required for travelers' },
        { status: 400 }
      );
    }

    if (role === 'GUIDE') {
      if (!nic) {
        return NextResponse.json(
          { error: 'NIC is required for guides' },
          { status: 400 }
        );
      }
      if (!country) {
        return NextResponse.json(
          { error: 'Country is required for guides' },
          { status: 400 }
        );
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      email,
      password,
      phone,
      name,
      role: role || 'TRAVELER',
      birthYear: parseInt(birthYear),
      gender,
      languages,
      country,
      nic,
    });

    // Create token and set session
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSession(token);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      } 
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}