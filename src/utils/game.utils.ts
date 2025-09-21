// @utils/game.utils.ts
import type { ScoreRecord } from 'types/games.type.ts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Initialize Supabase client (ensure env variables are set). */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Random integer between min and max (inclusive). */
export function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Submit a score to Supabase "scores" table.
 * Returns true if saved successfully, false if an error occurred.
 */
export async function submitScore(record: ScoreRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('scores').insert(record);
    if (error) throw error;
    console.log('Score saved to database:', record);
    return true;
  } catch (err) {
    console.error('Error saving score:', err);
    return false;
  }
}
