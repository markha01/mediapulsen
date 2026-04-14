import { useState } from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import client from '../../api/client';

const EMPTY = { title: '', published_at: '', views: '', time_on_page: '', conversions: '' };

export default function ManualEntryForm({ datasetId, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
    setError(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!datasetId) { setError('Select a dataset first'); return; }
    setSaving(true);
    setError(null);
    try {
      await client.post('/api/articles', {
        dataset_id: datasetId,
        title: form.title,
        published_at: form.published_at,
        views: parseInt(form.views, 10),
        time_on_page: parseInt(form.time_on_page, 10),
        conversions: parseInt(form.conversions, 10),
      });
      setSuccess(true);
      setForm(EMPTY);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { name: 'title',        label: 'Title',             type: 'text',   placeholder: 'Article headline…' },
    { name: 'published_at', label: 'Published Date',    type: 'date',   placeholder: '' },
    { name: 'views',        label: 'Views',             type: 'number', placeholder: '0' },
    { name: 'time_on_page', label: 'Time on Page (s)',  type: 'number', placeholder: '0' },
    { name: 'conversions',  label: 'Conversions',       type: 'number', placeholder: '0' },
  ];

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label className="block text-xs text-muted mb-1">{label}</label>
          <input
            type={type}
            value={form[name]}
            onChange={(e) => set(name, e.target.value)}
            placeholder={placeholder}
            min={type === 'number' ? '0' : undefined}
            className="w-full bg-[#0f1117] border border-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </div>
      ))}
      <Button type="submit" disabled={saving || !datasetId} className="w-full">
        {saving ? <><Spinner size="sm" /> Saving…</> : 'Add Article'}
      </Button>
      {success && <p className="text-good text-sm text-center">✓ Article added</p>}
      {error && <p className="text-bad text-sm">{error}</p>}
    </form>
  );
}
