import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Must match login route (hardcoded admin)
const ADMIN_EMAIL = 'admin@brainanalysis.com';

function isAdminRequest(request: NextRequest): boolean {
  const email = request.headers.get('x-user-email')?.toLowerCase();
  return email === ADMIN_EMAIL;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!id || id === 'admin') {
      return NextResponse.json(
        { error: 'Invalid user or cannot delete admin' },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User account deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
