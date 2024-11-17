import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const Body = data.get('Body')?.toString().toUpperCase();
    const From = data.get('From')?.toString();

    if (!Body || !From) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (Body === 'STOP' || Body === 'COMPLETED') {
      await prisma.todo.updateMany({
        where: { phoneNumber: From },
        data: {
          completed: true,
          stopReminders: true
        }
      });

      return NextResponse.json({
        message: 'Task marked as completed'
      });
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}