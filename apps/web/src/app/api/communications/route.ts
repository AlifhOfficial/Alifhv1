/**
 * Communications API - Public Submission
 * POST /api/communications - Anyone can submit (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCommunication } from '@alifh/database';


// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation (optional, basic check)
const PHONE_REGEX = /^[+]?[\d\s-]{7,20}$/;

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { name, email, phone, subject, message, type } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (phone && typeof phone === 'string' && phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Subject must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (subject.trim().length > 150) {
      return NextResponse.json(
        { error: 'Subject must be less than 150 characters' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (message.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Validate type if provided
    const validTypes = ['inquiry', 'support', 'partnership', 'feedback', 'report', 'other'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid communication type' },
        { status: 400 }
      );
    }

    // Create the communication
    const result = await createCommunication({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      type: type || 'inquiry',
    });

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Thank you! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Error submitting communication:', error);
    return NextResponse.json(
      { error: 'Failed to submit your message. Please try again.' },
      { status: 500 }
    );
  }
}
