import { useState, useRef } from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { previewCsv } from '../../utils/csvParser';
import client from '../../api/client';

export default function CsvUploader({ datasetId, onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  function handleFile(f) {
    if (!f || !f.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setPreview(previewCsv(e.target.result));
      } catch {
        setPreview(null);
      }
    };
    reader.readAsText(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function upload() {
    if (!file || !datasetId) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('dataset_id', datasetId);
      const res = await client.post('/api/upload', form);
      setResult(res.data);
      setFile(null);
      setPreview(null);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-white/2'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="text-4xl mb-3 opacity-60">📄</div>
        <p className="text-white font-medium">Drag & drop a CSV file here</p>
        <p className="text-sm text-muted mt-1">or click to browse</p>
        <p className="text-xs text-muted mt-3">Columns: title, date, views, time_on_page, conversions</p>
      </div>

      {file && (
        <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent">📄</span>
            <div>
              <p className="text-sm text-white font-medium">{file.name}</p>
              {preview && <p className="text-xs text-muted">{preview.totalLines} rows detected</p>}
            </div>
          </div>
          <Button onClick={upload} disabled={!datasetId || uploading} size="sm">
            {uploading ? <><Spinner size="sm" /> Uploading…</> : 'Upload'}
          </Button>
        </div>
      )}

      {preview && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-card/60">
                {preview.headers.map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {preview.rows.map((row, i) => (
                <tr key={i}>
                  {preview.headers.map((h) => (
                    <td key={h} className="py-2 px-3 text-gray-300 max-w-[200px] truncate">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && (
        <div className="bg-good/10 border border-good/30 rounded-lg px-4 py-3 text-sm text-good">
          ✓ Inserted {result.inserted} articles{result.skipped > 0 && ` · ${result.skipped} skipped`}
        </div>
      )}

      {error && (
        <div className="bg-bad/10 border border-bad/30 rounded-lg px-4 py-3 text-sm text-bad">
          {error}
        </div>
      )}
    </div>
  );
}
