import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Hardcoded admin account (no separate panel, same login page)
const ADMIN_EMAIL = 'admin@brainanalysis.com';
const ADMIN_PASSWORD = 'Admin@123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    // Validation
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded admin login (email or username "admin")
    if (
      (emailOrUsername.toLowerCase() === ADMIN_EMAIL || emailOrUsername.toLowerCase() === 'admin') &&
      password === ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            email: ADMIN_EMAIL,
            contactNumber: '',
            pmdcNumber: '',
            specialization: 'Administrator',
            isAdmin: true,
          },
        },
        { status: 200 }
      );
    }

    await connectDB();

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      contactNumber: user.contactNumber,
      pmdcNumber: user.pmdcNumber,
      specialization: user.specialization,
      isAdmin: false,
    };

    return NextResponse.json(
      { message: 'Login successful', user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
