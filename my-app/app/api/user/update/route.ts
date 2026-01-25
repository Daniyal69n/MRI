import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, firstName, lastName, email, contactNumber, pmdcNumber, specialization } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !email || !contactNumber) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 400 }
      );
    }

    // Update user
    const updateData: any = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      contactNumber,
    };
    
    if (pmdcNumber !== undefined) {
      updateData.pmdcNumber = pmdcNumber || undefined;
    }
    
    if (specialization !== undefined) {
      updateData.specialization = specialization;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data (without password)
    const userData = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      contactNumber: updatedUser.contactNumber,
      pmdcNumber: updatedUser.pmdcNumber,
      specialization: updatedUser.specialization,
    };

    return NextResponse.json(
      { message: 'Profile updated successfully', user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email is already taken' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
