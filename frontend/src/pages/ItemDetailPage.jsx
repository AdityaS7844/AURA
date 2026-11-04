import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Calendar, CheckCircle2, Flame, Award, Shirt, Sparkles, AlertCircle, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import ConfirmModal from '../components/common/ConfirmModal';
import { getItemApi, deleteItemApi, markItemWornApi } from '../api/wardrobe';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingWorn, setMarkingWorn] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemApi(id);
        setItem(data);
      } catch (err) {
        console.error('Failed to load item:', err);
        setError(err.response?.data?.detail || 'Clothing item not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItemApi(id);
      navigate('/wardrobe', { replace: true });
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.detail || 'Failed to delete clothing item.');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkWorn = async () => {
    setMarkingWorn(true);
    try {
      const updated = await markItemWornApi(id);
      setItem(updated);
    } catch (err) {
      console.error('Failed to mark item as worn:', err);
    } finally {
      setMarkingWorn(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-xs text-[var(--color-aura-muted)]">Loading clothing item details...</div>
      </AppLayout>
    );
  }

  if (error || !item) {
    return (
      <AppLayout>
        <div className="p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-[var(--font-heading)]">Item Not Found</h2>
          <p className="text-xs text-[var(--color-aura-muted)]">{error}</p>
          <Link
            to="/wardrobe"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-aura-primary)] text-white shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Wardrobe</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-aura-border)]">
          <div className="flex items-center space-x-3">
            <Link
              to="/wardrobe"
              className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors"
              title="Return to Wardrobe"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs text-[var(--color-aura-muted)] capitalize">My Wardrobe / {item.category}</span>
              <h1 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
                {item.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/wardrobe/edit/${item.id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-aura-text)] bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-transparent transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Photograph */}
          <div className="space-y-4">
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] overflow-hidden shadow-sm h-96 sm:h-[450px] flex items-center justify-center relative">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 text-[var(--color-aura-muted)]">
                  <div className="w-20 h-20 rounded-3xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Shirt className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-semibold capitalize">{item.name}</p>
                  <p className="text-xs text-[var(--color-aura-muted)] capitalize mt-1">No photograph uploaded</p>
                </div>
              )}
            </div>

            {/* Quick Wear Tracking Card */}
            <div className="bg-[var(--color-aura-surface)] p-5 rounded-2xl border border-[var(--color-aura-border)] shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-[var(--color-aura-text)]">
                  <Clock className="w-4 h-4 text-[var(--color-aura-primary)]" />
                  <span>Wear History</span>
                </div>
                <p className="text-xs text-[var(--color-aura-muted)] mt-0.5">
                  Worn <strong>{item.times_worn} times</strong>
                  {item.last_worn ? ` • Last worn on ${item.last_worn}` : ' • Never worn yet'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkWorn}
                disabled={markingWorn}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{markingWorn ? 'Updating...' : 'I Wore This Today'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Complete Attribute Specifications */}
          <div className="space-y-6">
            <div className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--color-aura-border)] shadow-xs space-y-6">
              <h2 className="text-lg font-bold font-[var(--font-heading)] pb-3 border-b border-[var(--color-aura-border)]">
                Clothing Specifications
              </h2>

              {/* Grid of Key Properties */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Category & Subtype
                  </span>
                  <span className="font-bold capitalize text-sm text-[var(--color-aura-text)]">
                    {item.category} {item.sub_type && `(${item.sub_type.replace('_', ' ')})`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Color
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 inline-block shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color_hex }}
                    />
                    <span className="font-bold capitalize text-sm">{item.color_name}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Pattern
                  </span>
                  <span className="font-bold capitalize text-sm text-[var(--color-aura-text)]">
                    {item.pattern}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Season
                  </span>
                  <span className="font-bold capitalize text-sm text-[var(--color-aura-text)]">
                    {item.season}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Formality Rating
                  </span>
                  <div className="flex items-center space-x-1.5 text-indigo-600 font-bold text-sm mt-0.5">
                    <Award className="w-4 h-4" />
                    <span>{item.formality} / 5</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Warmth Rating
                  </span>
                  <div className="flex items-center space-x-1.5 text-amber-600 font-bold text-sm mt-0.5">
                    <Flame className="w-4 h-4" />
                    <span>{item.warmth} / 5</span>
                  </div>
                </div>
              </div>

              {/* Fabric */}
              {item.fabric && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Fabric Composition
                  </span>
                  <p className="text-xs font-medium text-[var(--color-aura-text)]">{item.fabric}</p>
                </div>
              )}

              {/* Occasions */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-2">
                  Suitable Occasions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.occasions && item.occasions.length > 0 ? (
                    item.occasions.map((occ) => (
                      <span
                        key={occ}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium capitalize"
                      >
                        {occ}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--color-aura-muted)]">All general occasions</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1">
                    Personal Notes
                  </span>
                  <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed italic bg-[var(--color-aura-page)] p-3 rounded-xl border border-[var(--color-aura-border)]">
                    "{item.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Clothing Item"
        message={`Are you sure you want to permanently delete "${item.name}"? The clothing item and its photograph will be removed from your digital wardrobe.`}
        confirmText="Yes, Delete Item"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </AppLayout>
  );
}
