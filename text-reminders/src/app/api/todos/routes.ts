import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { sendReminder } from '../../../lib/twillio';

export async function POST(request: Request) {
  try {
    const { text, date, phoneNumber } = await request.json();

    const { data: todo, error } = await supabase
      .from('todos')
      .insert([
        {
          text,
          date,
          phone_number: phoneNumber,
          completed: false,
          stop_reminders: false
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Send initial reminder
    await sendReminder(phoneNumber, text);

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}