'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: Date;
  created_at?: string;
}

const ReminderForm = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return;
    }

    setTodos(data || []);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newTodo.trim(),
            date: selectedDate.toISOString(),
            phoneNumber: process.env.NEXT_PUBLIC_YOUR_PHONE_NUMBER,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create todo');
        }

        setNewTodo('');
        setIsCalendarOpen(false);
        fetchTodos(); // Refresh the list
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
      return;
    }

    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }

    fetchTodos();
  };

  const formatTodoDate = (date: string) => {
    return format(new Date(date), "MMM do ''yy");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl shadow-none border rounded-3xl">
        <CardHeader className="space-y-8 pb-0">
          <CardTitle className="text-2xl text-center font-semibold">
            Todo List
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 p-12">
          {/* Input Area with significantly increased spacing */}
          <div className="flex items-center gap-8 ml-12">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 h-12 text-lg border rounded-2xl px-8"
            />
            <div className="px-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="h-12 w-12 p-0 rounded-full border-2"
              >
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-4">
              <Button
                onClick={addTodo}
                className="h-12 ml-12 px-12 rounded-2xl bg-black hover:bg-gray-800 text-white"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Calendar Popup */}
          {isCalendarOpen && (
            <div className="border rounded-2xl p-4 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date || new Date());
                  setIsCalendarOpen(false);
                }}
                className="rounded-lg"
              />
            </div>
          )}

          {/* Todo Items with significantly increased spacing */}
          <div className="space-y-8">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-start gap-6 py-6 px-8">
                <div className="px-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(String(todo.id), todo.completed)}
                    className="mt-1.5 h-5 w-5 rounded border-2 border-gray-300"
                  />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div
                    className={`${
                      todo.completed ? 'line-through text-gray-400' : ''
                    } text-lg px-4`}
                  >
                    {todo.text}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-gray-500 px-4">
                      <CalendarIcon className="h-4 w-4" />
                      {formatTodoDate(todo.date)}
                    </div>
                    <div className="px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(String(todo.id))}
                        className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {todos.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No todos yet. Add some!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderForm;
