import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, X, AlertCircle, Shirt } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import ImageUploader from '../components/wardrobe/ImageUploader';
import { createItemApi, getItemApi, updateItemApi } from '../api/wardrobe';
import { CATEGORIES, SEASONS, PATTERNS, OCCASIONS } from '../utils/constants';

const SUBTYPES_BY_CATEGORY = {
  top: ['tshirt', 'shirt', 'polo', 'kurta', 'sweater', 'hoodie', 'tank', 'blouse'],
  bottom: ['jeans', 'trousers', 'shorts', 'skirt', 'joggers', 'leggings', 'chinos'],
  dress: ['casual_dress', 'formal_dress', 'gown', 'jumpsuit', 'kurti_set'],
  outerwear: ['jacket', 'blazer', 'coat', 'cardigan', 'shrug', 'raincoat'],
  footwear: ['sneakers', 'formal_shoes', 'sandals', 'boots', 'loafers', 'heels', 'flats', 'slippers'],
  accessory: ['watch', 'belt', 'scarf', 'cap', 'bag', 'jewellery', 'sunglasses'],
};

const COLOR_PRESETS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Beige', hex: '#D2B48C' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Purple', hex: '#7355CF' },
  { name: 'Blue', hex: '#3B5B92' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Red', hex: '#FF0000' },
];

export default function AddEditItemPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Form Field States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('top');
  const [subType, setSubType] = useState('');
  const [colorName, setColorName] = useState('Navy Blue');
  const [colorHex, setColorHex] = useState('#1F2A44');
  const [secondaryColorHex, setSecondaryColorHex] = useState('');
  const [pattern, setPattern] = useState('solid');
  const [season, setSeason] = useState('all');
  const [formality, setFormality] = useState(2);
  const [warmth, setWarmth] = useState(2);
  const [occasions, setOccasions] = useState(['casual']);
  const [fabric, setFabric] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // Status States
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing item data when in editing mode
  useEffect(() => {
    if (isEditing) {
      const loadItem = async () => {
        try {
          const item = await getItemApi(id);
          setName(item.name || '');
          setCategory(item.category || 'top');
          setSubType(item.sub_type || '');
          setColorName(item.color_name || '');
          setColorHex(item.color_hex || '#000000');
          setSecondaryColorHex(item.secondary_color_hex || '');
          setPattern(item.pattern || 'solid');
          setSeason(item.season || 'all');
          setFormality(item.formality || 2);
          setWarmth(item.warmth || 2);
          setOccasions(item.occasions || []);
          setFabric(item.fabric || '');
          setNotes(item.notes || '');
          setExistingImageUrl(item.image_url || null);
        } catch (err) {
          console.error('Failed to load item:', err);
          setError('Failed to load clothing item for editing.');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditing]);

  const toggleOccasion = (occ) => {
    if (occasions.includes(occ)) {
      setOccasions(occasions.filter((o) => o !== occ));
    } else {
      setOccasions([...occasions, occ]);
    }
  };

  const handlePresetColor = (preset) => {
    setColorName(preset.name);
    setColorHex(preset.hex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a name for this clothing item.');
      return;
    }

    if (!colorName.trim() || !colorHex.trim()) {
      setError('Please specify the primary color name and hex code.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      if (subType) formData.append('sub_type', subType);
      formData.append('color_name', colorName.trim());
      formData.append('color_hex', colorHex.trim());
      if (secondaryColorHex.trim()) formData.append('secondary_color_hex', secondaryColorHex.trim());
      formData.append('pattern', pattern);
      formData.append('season', season);
      formData.append('formality', formality.toString());
      formData.append('warmth', warmth.toString());
      formData.append('occasions', occasions.join(','));
      if (fabric.trim()) formData.append('fabric', fabric.trim());
      if (notes.trim()) formData.append('notes', notes.trim());
      if (imageFile) formData.append('image', imageFile);

      if (isEditing) {
        await updateItemApi(id, formData);
        navigate(`/wardrobe/${id}`);
      } else {
        const newItem = await createItemApi(formData);
        navigate(`/wardrobe/${newItem.id}`);
      }
    } catch (err) {
      console.error('Failed to save clothing item:', err);
      setError(err.response?.data?.detail || 'Failed to save clothing item. Check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSubTypes = SUBTYPES_BY_CATEGORY[category] || [];

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        {/* Top Header & Breadcrumbs */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-aura-border)]">
          <div className="flex items-center space-x-3">
            <Link
              to="/wardrobe"
              className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
                {isEditing ? 'Edit Clothing Item' : 'Add New Clothing'}
              </h1>
              <p className="text-xs text-[var(--color-aura-muted)]">
                {isEditing ? `Modifying item #${id}` : 'Provide item attributes and photograph'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--color-aura-muted)]">Loading item details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Image Uploader */}
              <div className="md:col-span-1 bg-[var(--color-aura-surface)] p-6 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
                <ImageUploader
                  currentImageUrl={existingImageUrl}
                  onFileSelect={setImageFile}
                  onRemove={() => setImageFile(null)}
                />
              </div>

              {/* Right Column: Attribute Inputs */}
              <div className="md:col-span-2 bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-aura-border)] shadow-xs space-y-5">
                {/* Item Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Classic White Oxford Shirt"
                    required
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none transition-all"
                  />
                </div>

                {/* Category & Subtype */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubType('');
                      }}
                      required
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none capitalize cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Sub-type
                    </label>
                    <select
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none capitalize cursor-pointer"
                    >
                      <option value="">Select sub-type (optional)</option>
                      {availableSubTypes.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Name & Hex */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        placeholder="e.g. Navy Blue, Off-White"
                        required
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                        Color Hex *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-[var(--color-aura-border)] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          maxLength={7}
                          className="block w-full px-3 py-2 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] text-xs font-mono uppercase outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Colors */}
                  <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto">
                    <span className="text-[10px] text-[var(--color-aura-muted)] uppercase font-semibold mr-1">Presets:</span>
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handlePresetColor(preset)}
                        className="w-5 h-5 rounded-md border border-black/15 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: preset.hex }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Pattern & Season */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Pattern
                    </label>
                    <select
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:border-[var(--color-aura-primary)] text-sm outline-none capitalize cursor-pointer"
                    >
                      {PATTERNS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Season
                    </label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:border-[var(--color-aura-primary)] text-sm outline-none capitalize cursor-pointer"
                    >
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Formality & Warmth Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)]">
                        Formality (1-5)
                      </label>
                      <span className="text-xs font-bold text-[var(--color-aura-primary)]">{formality} / 5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formality}
                      onChange={(e) => setFormality(parseInt(e.target.value, 10))}
                      className="w-full accent-[var(--color-aura-primary)] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--color-aura-muted)] mt-1">
                      <span>Casual (1)</span>
                      <span>Formal (5)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)]">
                        Warmth (1-5)
                      </label>
                      <span className="text-xs font-bold text-amber-600">{warmth} / 5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={warmth}
                      onChange={(e) => setWarmth(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--color-aura-muted)] mt-1">
                      <span>Light (1)</span>
                      <span>Very Warm (5)</span>
                    </div>
                  </div>
                </div>

                {/* Occasions Multi-Select Chips */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                    Suitable Occasions
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {OCCASIONS.map((occ) => {
                      const isSelected = occasions.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => toggleOccasion(occ)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border-[var(--color-aura-primary)] font-semibold'
                              : 'border-[var(--color-aura-border)] text-[var(--color-aura-muted)] hover:bg-gray-50'
                          }`}
                        >
                          {occ} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fabric & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Fabric (Optional)
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder="e.g. 100% Cotton, Linen, Wool"
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Dry clean only, fits slim"
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[var(--color-aura-border)] flex items-center justify-end space-x-3">
              <Link
                to={isEditing ? `/wardrobe/${id}` : '/wardrobe'}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-aura-muted)] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : isEditing ? 'Update Clothing Item' : 'Save to Wardrobe'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
