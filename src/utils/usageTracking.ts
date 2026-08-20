/**
 * Usage tracking for AI editor — freemium model.
 *
 * Guest users: $0.50/month, tracked in localStorage.
 * Registered users: $5.00/month, tracked in Supabase.
 * Admin users (site_admins): unlimited.
 * Users with own API key: unlimited (their cost).
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getLocalApiKey } from './editorStorage';

// ── Pricing (cents per million tokens) ──

const PRICING = {
  'claude-sonnet-4-5-20250929': { inputPerMillion: 300, outputPerMillion: 1500 },
  'claude-haiku-4-5-20251001': { inputPerMillion: 80, outputPerMillion: 400 },
} as const;

type ModelId = keyof typeof PRICING;

// ── Caps (in cents) ──

const GUEST_CAP_CENTS = 50;       // $0.50/month
const REGISTERED_CAP_CENTS = 500; // $5.00/month

// ── localStorage keys ──

const GUEST_USAGE_KEY = 'editor:guest-usage';

interface GuestUsage {
  monthKey: string;  // "2026-03"
  costCents: number;
}

// ── Cost calculation ──

export function calculateCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = PRICING[model as ModelId];
  if (!pricing) return 0;
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  return Math.round((inputCost + outputCost) * 100) / 100; // round to 0.01 cent
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ── Custom API key check ──

export function isUsingCustomApiKey(): boolean {
  return getLocalApiKey() !== null;
}

// ── Admin check ──

let adminCache: { userId: string; isAdmin: boolean; checkedAt: number } | null = null;
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function isUserAdmin(
  userId: string,
  supabase: SupabaseClient | null,
): Promise<boolean> {
  if (!supabase || !userId) return false;

  // Check cache
  if (adminCache && adminCache.userId === userId && Date.now() - adminCache.checkedAt < ADMIN_CACHE_TTL) {
    return adminCache.isAdmin;
  }

  try {
    const { data, error } = await supabase
      .from('site_admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    const isAdmin = !error && data !== null;
    adminCache = { userId, isAdmin, checkedAt: Date.now() };
    return isAdmin;
  } catch {
    return false;
  }
}

// ── Guest usage (localStorage) ──

function getGuestUsage(): GuestUsage {
  try {
    const raw = localStorage.getItem(GUEST_USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestUsage;
      if (parsed.monthKey === getCurrentMonthKey()) {
        return parsed;
      }
    }
  } catch {
    return { monthKey: getCurrentMonthKey(), costCents: 0 };
  }
  return { monthKey: getCurrentMonthKey(), costCents: 0 };
}

function saveGuestUsage(usage: GuestUsage): void {
  try {
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
  } catch (err) {
    console.warn('Failed to save guest usage:', err);
  }
}

export function recordGuestUsage(model: string, inputTokens: number, outputTokens: number): void {
  const cost = calculateCostCents(model, inputTokens, outputTokens);
  const usage = getGuestUsage();
  usage.costCents += cost;
  saveGuestUsage(usage);
}

export function getGuestRemainingCents(): number {
  const usage = getGuestUsage();
  return Math.max(0, GUEST_CAP_CENTS - usage.costCents);
}

export function isGuestCapExceeded(): boolean {
  return getGuestRemainingCents() <= 0;
}

// ── Registered user usage (Supabase) ──

export async function recordRegisteredUsage(
  userId: string,
  supabase: SupabaseClient | null,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  if (!supabase || !userId) return;
  const costCents = calculateCostCents(model, inputTokens, outputTokens);
  const monthKey = getCurrentMonthKey();

  try {
    // Upsert: increment cost for this month
    const { data: existing } = await supabase
      .from('editor_usage')
      .select('id, cost_cents')
      .eq('user_id', userId)
      .eq('month_key', monthKey)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('editor_usage')
        .update({
          cost_cents: existing.cost_cents + costCents,
          input_tokens: (existing as Record<string, number>).input_tokens + inputTokens,
          output_tokens: (existing as Record<string, number>).output_tokens + outputTokens,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('editor_usage')
        .insert({
          user_id: userId,
          month_key: monthKey,
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_cents: costCents,
        });
    }
  } catch (err) {
    console.error('Failed to record usage:', err);
  }
}

export async function getRegisteredUsedCents(
  userId: string,
  supabase: SupabaseClient | null,
): Promise<number> {
  if (!supabase || !userId) return 0;
  const monthKey = getCurrentMonthKey();

  try {
    const { data } = await supabase
      .from('editor_usage')
      .select('cost_cents')
      .eq('user_id', userId)
      .eq('month_key', monthKey);

    if (!data) return 0;
    return data.reduce((sum: number, row: { cost_cents: number }) => sum + row.cost_cents, 0);
  } catch {
    return 0;
  }
}

export async function getRegisteredRemainingCents(
  userId: string,
  supabase: SupabaseClient | null,
): Promise<number> {
  const used = await getRegisteredUsedCents(userId, supabase);
  return Math.max(0, REGISTERED_CAP_CENTS - used);
}

export async function isRegisteredCapExceeded(
  userId: string,
  supabase: SupabaseClient | null,
): Promise<boolean> {
  const remaining = await getRegisteredRemainingCents(userId, supabase);
  return remaining <= 0;
}

// ── Unified cap check ──

export interface BudgetStatus {
  canSend: boolean;
  reason?: 'guest_cap' | 'registered_cap';
  remainingCents: number;
  capCents: number;
  isAdmin: boolean;
  isCustomKey: boolean;
}

export async function checkBudget(
  user: User | null,
  supabase: SupabaseClient | null,
): Promise<BudgetStatus> {
  // Custom API key → unlimited
  if (isUsingCustomApiKey()) {
    return { canSend: true, remainingCents: Infinity, capCents: Infinity, isAdmin: false, isCustomKey: true };
  }

  // Not logged in → guest caps
  if (!user) {
    const remaining = getGuestRemainingCents();
    return {
      canSend: remaining > 0,
      reason: remaining <= 0 ? 'guest_cap' : undefined,
      remainingCents: remaining,
      capCents: GUEST_CAP_CENTS,
      isAdmin: false,
      isCustomKey: false,
    };
  }

  // Admin → unlimited
  const admin = await isUserAdmin(user.id, supabase);
  if (admin) {
    return { canSend: true, remainingCents: Infinity, capCents: Infinity, isAdmin: true, isCustomKey: false };
  }

  // Registered user → registered caps
  const remaining = await getRegisteredRemainingCents(user.id, supabase);
  return {
    canSend: remaining > 0,
    reason: remaining <= 0 ? 'registered_cap' : undefined,
    remainingCents: remaining,
    capCents: REGISTERED_CAP_CENTS,
    isAdmin: false,
    isCustomKey: false,
  };
}

// ── Record usage (unified) ──

export async function recordUsage(
  user: User | null,
  supabase: SupabaseClient | null,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  if (isUsingCustomApiKey()) return; // Don't track custom key usage

  if (!user) {
    recordGuestUsage(model, inputTokens, outputTokens);
  } else {
    const admin = await isUserAdmin(user.id, supabase);
    if (!admin) {
      await recordRegisteredUsage(user.id, supabase, model, inputTokens, outputTokens);
    }
  }
}

// ── Export constants for UI ──

export const CAPS = {
  guest: GUEST_CAP_CENTS,
  registered: REGISTERED_CAP_CENTS,
} as const;
