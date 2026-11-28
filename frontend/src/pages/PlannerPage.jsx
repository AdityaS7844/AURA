import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  CalendarCheck,
  Sparkles,
  Shirt,
  X,
  FileText,
  Wand2,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import WardrobeImage from '../components/common/WardrobeImage';
import { getPlannedOutfitsApi, scheduleOutfitApi, unscheduleOutfitApi } from '../api/planner';
import { getSavedOutfitsApi, submitFeedbackApi } from '../api/outfits';

// Helper to format Date to YYYY-MM-DD in local time
const formatDateYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get week dates starting on Monday
const getWeekDates = (baseDate) => {
  const curr = new Date(baseDate);
  // Get day of week, 0 is Sunday, 1 is Monday ... 6 is Saturday
  const day = curr.getDay();
  // Distance to Monday (if day is Sunday (0), difference is -6; otherwise 1 - day)
  const diff = curr.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(curr.setDate(diff));

  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for scheduling an outfit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateYMD(new Date()));
  const [availableOutfits, setAvailableOutfits] = useState([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Worn state tracker for visual feedback
  const [wornFeedback, setWornFeedback] = useState({});

  const weekDates = getWeekDates(currentDate);
  const startDateStr = formatDateYMD(weekDates[0]);
  const endDateStr = formatDateYMD(weekDates[6]);

  const fetchPlanned = async () => {
    try {
      setLoading(true);
      const res = await getPlannedOutfitsApi({
        start_date: startDateStr,
        end_date: endDateStr,
      });
      setPlannedOutfits(res.planned_outfits || []);
    } catch (err) {
      console.error('Failed to load planned outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanned();
  }, [startDateStr, endDateStr]);

  // Navigate weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open modal to schedule on a specific date
  const handleOpenScheduleModal = async (dateObj) => {
    const dateStr = formatDateYMD(dateObj);
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
    setSelectedOutfitId(null);
    setNotes('');

    try {
      setModalLoading(true);
      // Fetch user's saved and recent outfits
      const res = await getSavedOutfitsApi({ type: 'history', page: 1, limit: 20 });
      setAvailableOutfits(res.outfits || []);
      if (res.outfits && res.outfits.length > 0) {
        setSelectedOutfitId(res.outfits[0].id);
      }
    } catch (err) {
      console.error('Failed to load outfits for modal:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Submit schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOutfitId) return;

    try {
      setSubmitting(true);
      await scheduleOutfitApi({
        outfit_id: selectedOutfitId,
        planned_date: selectedDateStr,
        notes: notes.trim() || null,
      });
      setIsModalOpen(false);
      await fetchPlanned();
    } catch (err) {
      console.error('Failed to schedule outfit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Unschedule outfit
  const handleUnschedule = async (planId) => {
    try {
      await unscheduleOutfitApi(planId);
      setPlannedOutfits((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error('Failed to unschedule outfit:', err);
    }
  };

  // Mark outfit as worn
  const handleMarkWorn = async (outfitId) => {
    try {
      await submitFeedbackApi(outfitId, 'worn');
      setWornFeedback((prev) => ({ ...prev, [outfitId]: true }));
      setTimeout(() => {
        setWornFeedback((prev) => ({ ...prev, [outfitId]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to mark outfit as worn:', err);
    }
  };

  const todayStr = formatDateYMD(new Date());

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-aura-border)]">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
                Outfit Calendar Planner
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mt-1.5">
              Schedule your curated looks across the week and track outfit wear dates effortlessly.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleToday}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-aura-border)] hover:bg-gray-50 text-[var(--color-aura-text)] transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center border border-[var(--color-aura-border)] rounded-xl overflow-hidden bg-[var(--color-aura-surface)]">
              <button
                onClick={handlePrevWeek}
                className="p-2 hover:bg-gray-50 text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextWeek}
                className="p-2 hover:bg-gray-50 text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link
              to="/stylist"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Style New Look</span>
            </Link>
          </div>
        </div>

        {/* Date Range Sub-header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-aura-text)]">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-[var(--color-aura-muted)]">
            {plannedOutfits.length} outfit{plannedOutfits.length === 1 ? '' : 's'} scheduled this week
          </span>
        </div>

        {/* 7-Day Week Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((dateObj, idx) => {
            const dateStr = formatDateYMD(dateObj);
            const isToday = dateStr === todayStr;
            const dayPlans = plannedOutfits.filter((p) => p.planned_date === dateStr);

            return (
              <div
                key={dateStr}
                className={`flex flex-col rounded-2xl border transition-all min-h-[380px] p-3.5 ${
                  isToday
                    ? 'bg-indigo-50/40 border-[var(--color-aura-primary)] shadow-xs ring-1 ring-[var(--color-aura-primary)]/20'
                    : 'bg-[var(--color-aura-surface)] border-[var(--color-aura-border)]'
                }`}
              >
                {/* Column Day Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-aura-border)]">
                  <div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider block ${
                        isToday ? 'text-[var(--color-aura-primary)]' : 'text-[var(--color-aura-muted)]'
                      }`}
                    >
                      {DAY_NAMES[idx]}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${
                        isToday ? 'text-[var(--color-aura-primary)]' : 'text-[var(--color-aura-text)]'
                      }`}
                    >
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[var(--color-aura-primary)] text-white">
                      Today
                    </span>
                  )}
                </div>

                {/* Scheduled Outfits in Day Column */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {dayPlans.map((plan) => {
                    const outfit = plan.outfit;
                    const isWorn = wornFeedback[outfit.id];

                    return (
                      <div
                        key={plan.id}
                        className="rounded-xl border border-[var(--color-aura-border)] bg-white p-2.5 shadow-2xs hover:shadow-xs transition-all space-y-2 group"
                      >
                        {/* Top bar with occasion & remove */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-bold uppercase">
                            {outfit.occasion}
                          </span>
                          <button
                            onClick={() => handleUnschedule(plan.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded"
                            title="Unschedule Outfit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Outfit Name */}
                        <h4 className="text-xs font-bold text-gray-900 truncate" title={outfit.name}>
                          {outfit.name}
                        </h4>

                        {/* Items collage thumbnail */}
                        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden bg-gray-50 p-1 border border-gray-100">
                          {outfit.items?.slice(0, 3).map((item) => (
                            <div key={item.id} className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center">
                              <WardrobeImage
                                src={item.image_url}
                                alt={item.name}
                                category={item.category}
                                className="w-full h-full object-cover"
                                fallbackClassName="flex items-center justify-center text-gray-400 p-0.5 w-full h-full"
                                iconSize="w-3.5 h-3.5"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Note if attached */}
                        {plan.notes && (
                          <p className="text-[10px] text-gray-500 italic bg-gray-50 p-1.5 rounded truncate" title={plan.notes}>
                            "{plan.notes}"
                          </p>
                        )}

                        {/* Mark as worn button */}
                        <button
                          onClick={() => handleMarkWorn(outfit.id)}
                          className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                            isWorn
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isWorn ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Worn Recorded!</span>
                            </>
                          ) : (
                            <>
                              <CalendarCheck className="w-3 h-3" />
                              <span>Mark Worn</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Empty state per column if no items */}
                  {dayPlans.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-[var(--color-aura-muted)] border border-dashed border-gray-200 rounded-xl">
                      No outfit set
                    </div>
                  )}
                </div>

                {/* + Plan Button at bottom of column */}
                <button
                  onClick={() => handleOpenScheduleModal(dateObj)}
                  className="mt-3 w-full py-1.5 rounded-xl text-xs font-semibold text-[var(--color-aura-primary)] hover:bg-[var(--color-aura-lavender)]/50 transition-colors flex items-center justify-center space-x-1 cursor-pointer border border-transparent hover:border-[var(--color-aura-primary)]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan Outfit</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Schedule Outfit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-aura-border)]">
                <div>
                  <h3 className="text-base font-bold font-[var(--font-heading)]">Schedule Outfit</h3>
                  <p className="text-xs text-[var(--color-aura-muted)]">
                    For {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalLoading ? (
                <div className="py-12 text-center text-xs text-[var(--color-aura-muted)]">Loading your outfits...</div>
              ) : availableOutfits.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-[var(--color-aura-muted)]">You don't have any outfits styled yet.</p>
                  <Link
                    to="/stylist"
                    className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)]"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate in AI Stylist</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  {/* Select Outfit */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2">
                      Choose Look from Your History
                    </label>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {availableOutfits.map((outfit) => {
                        const isSelected = selectedOutfitId === outfit.id;
                        return (
                          <div
                            key={outfit.id}
                            onClick={() => setSelectedOutfitId(outfit.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)]/40 ring-1 ring-[var(--color-aura-primary)]'
                                : 'border-[var(--color-aura-border)] bg-[var(--color-aura-page)] hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="flex -space-x-2 shrink-0">
                                {outfit.items?.slice(0, 2).map((item) => (
                                  <div
                                    key={item.id}
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 overflow-hidden"
                                  >
                                    <WardrobeImage
                                      src={item.image_url}
                                      alt={item.name}
                                      category={item.category}
                                      className="w-full h-full object-cover"
                                      fallbackClassName="flex items-center justify-center text-gray-400 p-0.5 w-full h-full"
                                      iconSize="w-3.5 h-3.5"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-[var(--color-aura-text)] block truncate">
                                  {outfit.name}
                                </span>
                                <span className="text-[10px] text-[var(--color-aura-muted)] capitalize">
                                  {outfit.occasion} • {outfit.items?.length} items
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[var(--color-aura-primary)] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Day Note / Event (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Morning team meeting, dinner with friends"
                      maxLength={100}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] text-xs outline-none focus:border-[var(--color-aura-primary)]"
                    />
                  </div>

                  <div className="pt-3 border-t border-[var(--color-aura-border)] flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-aura-muted)] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !selectedOutfitId}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Scheduling...' : 'Save to Calendar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
