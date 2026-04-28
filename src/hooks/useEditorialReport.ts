/**
 * useEditorialReport — Orchestration hook for the editorial report pipeline.
 *
 * Manages:
 * - Pre-flight answer persistence (Supabase for auth users, localStorage for guests)
 * - Full generation pipeline with progress tracking
 * - Poet input for debate continuation
 * - Report history (load/list)
 * - Cancellation via AbortController
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  PreFlightAnswers,
  SpineAnalysis,
  EditorReading,
  DebateRound,
  SectionEditorial,
  PoemAssessment,
  ReportProgress,
  ReportPhase,
  ReportStatus,
  EditorialReportData,
  EditorialReportSummary,
  TokenUsage,
} from '../types/editor';
import type { CollectionPoem, CollectionSection, PoemStatus } from '../types/collection';
import {
  runSpineAnalysis,
  runEditors,
  runDebate,
  continueDebateWithPoetInput,
  buildSectionEditorials,
  buildPerPoemAssessments,
  synthesizeReport,
  type EditorialPoemData,
} from '../utils/editorialAgents';
import { recordUsage, isUserAdmin } from '../utils/usageTracking';
import { getLocalApiKey } from '../utils/editorStorage';

const FREE_REPORTS_PER_DAY = 3;

/** Count today's editorial reports for the user (UTC day). */
async function countTodaysReports(userId: string): Promise<number> {
  if (!supabase) return 0;
  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('editor_reports')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .gte('created_at', startOfDayUtc.toISOString());
  if (error || !data) return 0;
  return data.length;
}

// ── localStorage keys ──

const PREFLIGHT_PREFIX = 'editor:preflight:';
const REPORT_PREFIX = 'editor:report:';
const REPORT_INDEX_PREFIX = 'editor:report-index:';

// ── Helpers ──

/** Convert CollectionPoem + sections into EditorialPoemData in manuscript order */
function toEditorialPoems(
  poems: CollectionPoem[],
  sections: CollectionSection[],
): EditorialPoemData[] {
  const sectionMap = new Map(sections.map(s => [s.id, s]));

  // Build sort key: (sectionOrder, poemOrder)
  return [...poems]
    .sort((a, b) => {
      const secA = a.sectionId ? sectionMap.get(a.sectionId) : null;
      const secB = b.sectionId ? sectionMap.get(b.sectionId) : null;
      const secOrderA = secA ? secA.order : -1;
      const secOrderB = secB ? secB.order : -1;
      if (secOrderA !== secOrderB) return secOrderA - secOrderB;
      return a.order - b.order;
    })
    .map((poem, idx) => {
      const section = poem.sectionId ? sectionMap.get(poem.sectionId) : null;
      return {
        id: poem.id,
        title: poem.title,
        content: poem.content,
        sectionName: section?.name ?? null,
        status: (poem.status || 'draft') as PoemStatus,
        sortOrder: idx,
      };
    });
}

/** Phase ordering for progress calculation */
const PHASE_ORDER: ReportPhase[] = [
  'preflight',
  'editors_reading',
  'ambition_comparison',
  'comparing_notes',
  'debate',
  'poem_assessments',
  'synthesis',
  'complete',
];

const PHASE_LABELS: Record<ReportPhase, string> = {
  preflight: 'Preparing your collection...',
  editors_reading: 'Three editors are reading your poems...',
  ambition_comparison: 'Comparing to your stated ambitions...',
  comparing_notes: 'Editors are comparing notes...',
  debate: 'Editors are debating their assessments...',
  poem_assessments: 'Building individual poem assessments...',
  synthesis: 'Writing your editorial letter...',
  complete: 'Report complete.',
};

function makeProgress(phase: ReportPhase, phaseProgress: number, startedAt: string): ReportProgress {
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const totalPhases = PHASE_ORDER.length - 1; // exclude 'complete'
  const overallProgress = phase === 'complete'
    ? 100
    : Math.round(((phaseIdx + phaseProgress / 100) / totalPhases) * 100);

  return {
    currentPhase: phase,
    phaseProgress,
    overallProgress,
    statusMessage: PHASE_LABELS[phase],
    startedAt,
  };
}

// ── Pre-flight persistence ──

async function loadPreFlightAnswers(
  user: User | null,
  collectionId: string,
): Promise<PreFlightAnswers | null> {
  if (user && supabase) {
    try {
      const { data } = await supabase
        .from('editor_preflight_answers')
        .select('answers')
        .eq('user_id', user.id)
        .eq('collection_id', collectionId)
        .maybeSingle();
      if (data?.answers) return data.answers as PreFlightAnswers;
    } catch {
      // Fall through to null
    }
    return null;
  }

  // Guest: localStorage
  try {
    const raw = localStorage.getItem(PREFLIGHT_PREFIX + collectionId);
    if (raw) return JSON.parse(raw) as PreFlightAnswers;
  } catch {
    // corrupted
  }
  return null;
}

async function savePreFlightAnswers(
  user: User | null,
  collectionId: string,
  answers: PreFlightAnswers,
): Promise<void> {
  if (user && supabase) {
    await supabase
      .from('editor_preflight_answers')
      .upsert({
        user_id: user.id,
        collection_id: collectionId,
        answers,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,collection_id' });
    return;
  }

  // Guest: localStorage
  localStorage.setItem(PREFLIGHT_PREFIX + collectionId, JSON.stringify(answers));
}

// ── Report persistence ──

async function saveReport(
  user: User | null,
  report: EditorialReportData,
): Promise<void> {
  if (user) {
    const row = {
      id: report.id,
      user_id: report.userId,
      collection_id: report.collectionId,
      preflight_answers: report.preFlightAnswers,
      spine_analysis: report.spineAnalysis,
      editor_readings: report.editorReadings,
      section_editorials: report.sectionEditorials,
      debate_log: report.debateLog,
      per_poem_assessments: report.perPoemAssessments,
      synthesized_report: report.synthesizedReport,
      status: report.status,
      progress: report.progress,
      created_at: report.createdAt,
    };
    if (supabase) await supabase.from('editor_reports').upsert(row, { onConflict: 'id' });
    return;
  }

  // Guest: localStorage — keep last 3
  const key = REPORT_PREFIX + report.id;
  localStorage.setItem(key, JSON.stringify(report));

  // Update index
  const indexKey = REPORT_INDEX_PREFIX + report.collectionId;
  let index: string[] = [];
  try {
    const raw = localStorage.getItem(indexKey);
    if (raw) index = JSON.parse(raw);
  } catch { /* */ }

  if (!index.includes(report.id)) {
    index.unshift(report.id);
  }
  // Keep only last 3
  while (index.length > 3) {
    const oldId = index.pop()!;
    localStorage.removeItem(REPORT_PREFIX + oldId);
  }
  localStorage.setItem(indexKey, JSON.stringify(index));
}

async function loadReport(
  user: User | null,
  reportId: string,
): Promise<EditorialReportData | null> {
  if (user && supabase) {
    try {
      const { data } = await supabase
        .from('editor_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      if (!data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        collectionId: data.collection_id,
        preFlightAnswers: data.preflight_answers,
        spineAnalysis: data.spine_analysis,
        editorReadings: data.editor_readings,
        sectionEditorials: data.section_editorials,
        debateLog: data.debate_log,
        perPoemAssessments: data.per_poem_assessments,
        synthesizedReport: data.synthesized_report,
        status: data.status as ReportStatus,
        progress: data.progress as ReportProgress,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  }

  // Guest: localStorage
  try {
    const raw = localStorage.getItem(REPORT_PREFIX + reportId);
    if (raw) return JSON.parse(raw) as EditorialReportData;
  } catch { /* */ }
  return null;
}

async function listReports(
  user: User | null,
  collectionId: string,
): Promise<EditorialReportSummary[]> {
  if (user && supabase) {
    try {
      const { data } = await supabase
        .from('editor_reports')
        .select('id, created_at, status')
        .eq('user_id', user.id)
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        return data.map(r => ({
          id: r.id,
          createdAt: r.created_at,
          status: r.status as ReportStatus,
        }));
      }
    } catch { /* */ }
    return [];
  }

  // Guest: localStorage
  const indexKey = REPORT_INDEX_PREFIX + collectionId;
  try {
    const raw = localStorage.getItem(indexKey);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    const summaries: EditorialReportSummary[] = [];
    for (const id of ids) {
      const reportRaw = localStorage.getItem(REPORT_PREFIX + id);
      if (reportRaw) {
        const report = JSON.parse(reportRaw) as EditorialReportData;
        summaries.push({
          id: report.id,
          createdAt: report.createdAt,
          status: report.status,
        });
      }
    }
    return summaries;
  } catch { /* */ }
  return [];
}

// ── Hook ──

export interface UseEditorialReportOptions {
  user: User | null;
  collectionId: string;
  collectionName: string;
  poems: CollectionPoem[];
  sections: CollectionSection[];
}

export function useEditorialReport({
  user,
  collectionId,
  collectionName,
  poems,
  sections,
}: UseEditorialReportOptions) {
  // ── State ──
  const [report, setReport] = useState<EditorialReportData | null>(null);
  const [progress, setProgress] = useState<ReportProgress | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<PreFlightAnswers | null>(null);
  const [showPreFlight, setShowPreFlight] = useState(false);
  const [reportHistory, setReportHistory] = useState<EditorialReportSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Pre-sorted poems in manuscript order
  const editorialPoems = useMemo(
    () => toEditorialPoems(poems, sections),
    [poems, sections],
  );

  // ── Load saved pre-flight answers on mount / collection change ──
  useEffect(() => {
    let cancelled = false;
    loadPreFlightAnswers(user, collectionId).then(answers => {
      if (!cancelled) setSavedAnswers(answers);
    });
    return () => { cancelled = true; };
  }, [user, collectionId]);

  // ── Load report history on mount / collection change ──
  useEffect(() => {
    let cancelled = false;
    listReports(user, collectionId).then(reports => {
      if (!cancelled) setReportHistory(reports);
    });
    return () => { cancelled = true; };
  }, [user, collectionId]);

  // ── Usage tracking helper ──
  const trackUsage = useCallback((usage: TokenUsage) => {
    if (user) {
      recordUsage(user, supabase, usage.model, usage.inputTokens, usage.outputTokens);
    }
  }, [user]);

  // ── Cancel generation ──
  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsGenerating(false);
    setProgress(null);
  }, []);

  // ── Start generation pipeline ──
  const startGeneration = useCallback(async (answers: PreFlightAnswers) => {
    if (editorialPoems.length === 0) {
      setError('No poems in this collection.');
      return;
    }

    // Daily cap: 3 free editorial reports per day. Skipped for admins and BYOK users.
    if (user) {
      const usingOwnKey = getLocalApiKey() !== null;
      const admin = await isUserAdmin(user.id, supabase);
      if (!admin && !usingOwnKey) {
        const today = await countTodaysReports(user.id);
        if (today >= FREE_REPORTS_PER_DAY) {
          setError(
            `You've used your ${FREE_REPORTS_PER_DAY} free editorial reports for today. Try again tomorrow, or add your own Anthropic API key in Editor settings to keep going.`,
          );
          return;
        }
      }
    }

    setError(null);
    setIsGenerating(true);
    setReport(null);

    const abortController = new AbortController();
    abortRef.current = abortController;
    const signal = abortController.signal;
    const startedAt = new Date().toISOString();

    // Save pre-flight answers
    await savePreFlightAnswers(user, collectionId, answers);
    setSavedAnswers(answers);

    // Generate report ID
    const reportId = crypto.randomUUID
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Working report data — updated at each phase
    const working: EditorialReportData = {
      id: reportId,
      userId: user?.id || 'local',
      collectionId,
      preFlightAnswers: answers,
      spineAnalysis: null,
      editorReadings: [],
      sectionEditorials: [],
      debateLog: [],
      perPoemAssessments: [],
      synthesizedReport: '',
      status: 'generating',
      progress: makeProgress('preflight', 0, startedAt),
      createdAt: startedAt,
    };

    try {
      // ── Phase 1: Spine Analysis ──
      setProgress(makeProgress('editors_reading', 0, startedAt));
      const spineResult = await runSpineAnalysis(editorialPoems, answers, trackUsage, signal);
      working.spineAnalysis = spineResult;

      if (signal.aborted) return;

      // ── Phase 2: Three editors read ──
      setProgress(makeProgress('editors_reading', 40, startedAt));
      let editorsComplete = 0;
      const editorReadings = await runEditors(
        editorialPoems,
        spineResult,
        answers,
        trackUsage,
        () => {
          editorsComplete++;
          setProgress(makeProgress('editors_reading', 40 + Math.round((editorsComplete / 3) * 60), startedAt));
        },
        signal,
      );
      working.editorReadings = editorReadings;

      if (signal.aborted) return;

      // ── Phase 3: Compare to ambitions ──
      setProgress(makeProgress('ambition_comparison', 100, startedAt));

      if (signal.aborted) return;

      // ── Phase 4: Compare notes / Section editorials ──
      setProgress(makeProgress('comparing_notes', 0, startedAt));
      const sectionEditorials = await buildSectionEditorials(
        editorialPoems,
        editorReadings,
        spineResult,
        answers,
        trackUsage,
        signal,
      );
      working.sectionEditorials = sectionEditorials;
      setProgress(makeProgress('comparing_notes', 100, startedAt));

      if (signal.aborted) return;

      // ── Phase 5: Debate ──
      setProgress(makeProgress('debate', 0, startedAt));
      const debateRounds = await runDebate(editorReadings, spineResult, trackUsage, signal, editorialPoems);
      working.debateLog = debateRounds;
      setProgress(makeProgress('debate', 100, startedAt));

      if (signal.aborted) return;

      // Check if any debate topics need poet input
      const needsPoetInput = debateRounds.some(r => r.status === 'poet_input_needed');
      if (needsPoetInput) {
        working.status = 'awaiting_poet';
        working.progress = makeProgress('debate', 100, startedAt);
        setReport({ ...working });
        setProgress(working.progress);
        await saveReport(user, working);
        setIsGenerating(false);
        return;
      }

      // ── Phase 6: Per-poem assessments ──
      setProgress(makeProgress('poem_assessments', 0, startedAt));
      const poemAssessments = await buildPerPoemAssessments(
        editorialPoems,
        editorReadings,
        spineResult,
        trackUsage,
        signal,
      );
      working.perPoemAssessments = poemAssessments;
      setProgress(makeProgress('poem_assessments', 100, startedAt));

      if (signal.aborted) return;

      // ── Phase 7: Synthesis ──
      setProgress(makeProgress('synthesis', 0, startedAt));
      let synthesized = '';

      await synthesizeReport(
        spineResult,
        editorReadings,
        sectionEditorials,
        debateRounds,
        poemAssessments,
        answers,
        editorialPoems,
        {
          onToken: (token) => {
            synthesized += token;
            // Update progress periodically
            const estimatedLength = 5000;
            const pct = Math.min(95, Math.round((synthesized.length / estimatedLength) * 100));
            setProgress(makeProgress('synthesis', pct, startedAt));
          },
          onDone: (fullText) => {
            synthesized = fullText;
          },
          onError: (err) => {
            throw err;
          },
          onUsage: trackUsage,
        },
        signal,
      );

      if (signal.aborted) return;

      working.synthesizedReport = synthesized;
      working.status = 'complete';
      working.progress = makeProgress('complete', 100, startedAt);

      // Save final report
      await saveReport(user, working);

      setReport({ ...working });
      setProgress(working.progress);
      setIsGenerating(false);

      // Refresh history
      listReports(user, collectionId).then(setReportHistory);

    } catch (err: unknown) {
      if (signal.aborted) return;

      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      working.status = 'error';
      setReport({ ...working });
      setIsGenerating(false);
    }
  }, [editorialPoems, user, collectionId, trackUsage]);

  // ── Submit poet input for debate continuation ──
  const submitPoetInput = useCallback(async (poetInputs: Record<string, string>) => {
    if (!report || report.status !== 'awaiting_poet') return;

    setIsGenerating(true);
    setError(null);

    const abortController = new AbortController();
    abortRef.current = abortController;
    const signal = abortController.signal;
    const startedAt = report.progress.startedAt;

    const working = { ...report };

    try {
      // Apply poet inputs to existing debate rounds
      for (const round of working.debateLog) {
        if (round.status === 'poet_input_needed' && poetInputs[round.topic]) {
          round.poetInput = poetInputs[round.topic];
        }
      }

      // Continue debate with poet perspective
      setProgress(makeProgress('debate', 50, startedAt));
      const continuedRounds = await continueDebateWithPoetInput(
        working.debateLog,
        poetInputs,
        working.editorReadings,
        trackUsage,
        signal,
      );
      working.debateLog = [...working.debateLog, ...continuedRounds];
      setProgress(makeProgress('debate', 100, startedAt));

      if (signal.aborted) return;

      // Per-poem assessments
      setProgress(makeProgress('poem_assessments', 0, startedAt));
      const poemAssessments = await buildPerPoemAssessments(
        editorialPoems,
        working.editorReadings,
        working.spineAnalysis!,
        trackUsage,
        signal,
      );
      working.perPoemAssessments = poemAssessments;
      setProgress(makeProgress('poem_assessments', 100, startedAt));

      if (signal.aborted) return;

      // Synthesis
      setProgress(makeProgress('synthesis', 0, startedAt));
      let synthesized = '';

      await synthesizeReport(
        working.spineAnalysis!,
        working.editorReadings,
        working.sectionEditorials,
        working.debateLog,
        poemAssessments,
        working.preFlightAnswers,
        editorialPoems,
        {
          onToken: (token) => {
            synthesized += token;
            const pct = Math.min(95, Math.round((synthesized.length / 5000) * 100));
            setProgress(makeProgress('synthesis', pct, startedAt));
          },
          onDone: (fullText) => { synthesized = fullText; },
          onError: (err) => { throw err; },
          onUsage: trackUsage,
        },
        signal,
      );

      if (signal.aborted) return;

      working.synthesizedReport = synthesized;
      working.status = 'complete';
      working.progress = makeProgress('complete', 100, startedAt);

      await saveReport(user, working);
      setReport({ ...working });
      setProgress(working.progress);
      setIsGenerating(false);

      listReports(user, collectionId).then(setReportHistory);

    } catch (err: unknown) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setIsGenerating(false);
    }
  }, [report, editorialPoems, user, collectionId, trackUsage]);

  // ── Load an existing report by ID ──
  const loadExistingReport = useCallback(async (reportId: string) => {
    setError(null);
    const loaded = await loadReport(user, reportId);
    if (loaded) {
      setReport(loaded);
      setProgress(loaded.progress);
    } else {
      setError('Could not load report.');
    }
  }, [user]);

  // ── Refresh history ──
  const refreshHistory = useCallback(async () => {
    const reports = await listReports(user, collectionId);
    setReportHistory(reports);
  }, [user, collectionId]);

  return {
    // State
    report,
    progress,
    savedAnswers,
    showPreFlight,
    reportHistory,
    error,
    isGenerating,
    editorialPoems,

    // Actions
    setShowPreFlight,
    startGeneration,
    submitPoetInput,
    cancelGeneration,
    loadReport: loadExistingReport,
    refreshHistory,
  };
}
