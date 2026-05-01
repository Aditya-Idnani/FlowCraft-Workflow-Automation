"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Calendar, Timer, CalendarDays, Power, PowerOff, RefreshCw } from "lucide-react";
import { scheduleApi, type ScheduleInfo } from "@/lib/api";

type SchedulePreset = {
  id: string;
  label: string;
  icon: typeof Clock;
  description: string;
};

const PRESET_META: Record<string, { icon: typeof Clock; description: string }> = {
  every_minute: { icon: Timer,        description: "Runs every 60 seconds" },
  hourly:       { icon: Clock,        description: "Runs at the top of every hour" },
  daily:        { icon: Calendar,     description: "Runs daily at 9:00 AM" },
  weekly:       { icon: CalendarDays, description: "Runs every Monday at 9:00 AM" },
};

const PRESETS: SchedulePreset[] = [
  { id: "every_minute", label: "Every Minute", ...PRESET_META.every_minute },
  { id: "hourly",       label: "Hourly",       ...PRESET_META.hourly },
  { id: "daily",        label: "Daily",        ...PRESET_META.daily },
  { id: "weekly",       label: "Weekly",       ...PRESET_META.weekly },
];

type SchedulePanelProps = {
  workflowId: string;
  workflowName: string;
};

export default function SchedulePanel({ workflowId, workflowName }: SchedulePanelProps) {
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [nextRunCountdown, setNextRunCountdown] = useState("");

  // Load current schedule
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    const { data } = await scheduleApi.get(workflowId);
    if (data) {
      setIsScheduled(data.scheduled);
      setSchedule(data.schedule);
      setSelectedPreset(data.schedule?.preset ?? null);
    }
    setLoading(false);
  }, [workflowId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Countdown timer for next run
  useEffect(() => {
    if (!schedule?.nextRun) {
      setNextRunCountdown("");
      return;
    }

    function updateCountdown() {
      const now = new Date();
      const next = new Date(schedule!.nextRun!);
      const diff = next.getTime() - now.getTime();

      if (diff <= 0) {
        setNextRunCountdown("Running now…");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setNextRunCountdown(`${hours}h ${mins}m ${secs}s`);
      } else if (mins > 0) {
        setNextRunCountdown(`${mins}m ${secs}s`);
      } else {
        setNextRunCountdown(`${secs}s`);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [schedule?.nextRun]);

  // Set schedule
  const handleSetSchedule = async (preset: string) => {
    setSaving(true);
    const { data, error } = await scheduleApi.set(workflowId, preset);
    if (error) {
      alert(`Schedule error: ${error}`);
    } else if (data) {
      setSchedule(data.schedule);
      setIsScheduled(true);
      setSelectedPreset(preset);
    }
    setSaving(false);
  };

  // Remove schedule
  const handleRemoveSchedule = async () => {
    setSaving(true);
    await scheduleApi.remove(workflowId);
    setSchedule(null);
    setIsScheduled(false);
    setSelectedPreset(null);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-amber)]/15 to-[var(--accent-yellow)]/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[var(--accent-amber)]" />
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)]">Schedule</span>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-[var(--accent-amber)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_50px_var(--glow-amber)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-amber)]/15 to-[var(--accent-yellow)]/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[var(--accent-amber)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Schedule</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {isScheduled ? "Active" : "Not scheduled"}
            </p>
          </div>
        </div>

        {/* Status pill */}
        {isScheduled && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] shadow-[0_0_8px_var(--glow-green)]">
            Active
          </span>
        )}
      </div>

      {/* Active schedule info */}
      {isScheduled && schedule && (
        <div className="mb-5 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {schedule.label}
            </span>
          </div>

          {/* Next run */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)]">Next run</span>
            <span className="text-sm font-mono font-semibold text-[var(--accent-cyan)]">
              {nextRunCountdown || "—"}
            </span>
          </div>

          {/* Next run time */}
          {schedule.nextRun && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">At</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {new Date(schedule.nextRun).toLocaleString()}
              </span>
            </div>
          )}

          {/* Last run */}
          {schedule.lastRun && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Last run</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    schedule.lastStatus === "success"
                      ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
                      : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
                  }`}
                >
                  {schedule.lastStatus}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {new Date(schedule.lastRun).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {/* Cron expression */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-default)]">
            <span className="text-xs text-[var(--text-muted)]">Cron</span>
            <code className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">
              {schedule.cronExpr}
            </code>
          </div>
        </div>
      )}

      {/* Preset selector */}
      <div className="space-y-2 mb-4">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedPreset === preset.id;
          const isActive = isScheduled && selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSetSchedule(preset.id)}
              disabled={saving}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 disabled:opacity-50 ${
                isActive
                  ? "bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/30 text-[var(--accent-amber)] shadow-[0_0_12px_var(--glow-amber)]"
                  : isSelected
                    ? "bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 text-[var(--accent-blue)]"
                    : "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{preset.label}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">{preset.description}</span>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] shadow-[0_0_6px_var(--accent-green)] shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Remove schedule button */}
      {isScheduled && (
        <button
          onClick={handleRemoveSchedule}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--accent-red)]/20 text-[var(--accent-red)] text-sm font-medium hover:bg-[var(--accent-red)]/10 hover:border-[var(--accent-red)]/40 transition-all duration-200 disabled:opacity-50"
        >
          <PowerOff className="w-4 h-4" />
          Remove Schedule
        </button>
      )}
    </div>
  );
}
