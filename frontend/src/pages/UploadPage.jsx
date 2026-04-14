import { useEffect, useState } from 'react';
import useAppStore from '../store/appStore';
import client from '../api/client';
import CsvUploader from '../components/upload/CsvUploader';
import ManualEntryForm from '../components/upload/ManualEntryForm';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function UploadPage() {
  const { datasets, activeDatasetId, setDatasets, addDataset, setActiveDatasetId, removeDataset } = useAppStore();
  const [tab, setTab] = useState('csv');
  const [creatingDataset, setCreatingDataset] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loadingDs, setLoadingDs] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState(null);

  useEffect(() => {
    setLoadingDs(true);
    client.get('/api/datasets')
      .then((res) => { setDatasets(res.data); setLoadingDs(false); })
      .catch(() => setLoadingDs(false));
  }, []);

  useEffect(() => {
    if (!activeDatasetId) { setFiles([]); setArticles([]); return; }
    setLoadingFiles(true);
    client.get(`/api/datasets/${activeDatasetId}/files`)
      .then((res) => { setFiles(res.data); setLoadingFiles(false); })
      .catch(() => setLoadingFiles(false));
    setLoadingArticles(true);
    client.get(`/api/articles?dataset_id=${activeDatasetId}`)
      .then((res) => { setArticles(res.data); setLoadingArticles(false); })
      .catch(() => setLoadingArticles(false));
  }, [activeDatasetId]);

  async function createDataset() {
    if (!newName.trim()) return;
    setCreatingDataset(true);
    try {
      const res = await client.post('/api/datasets', { name: newName.trim() });
      addDataset(res.data);
      setActiveDatasetId(res.data.id);
      setNewName('');
      setShowCreate(false);
    } finally {
      setCreatingDataset(false);
    }
  }

  async function deleteDataset(id) {
    setDeletingId(id);
    try {
      await client.delete(`/api/datasets/${id}`);
      removeDataset(id);
      if (activeDatasetId === id) { setFiles([]); setArticles([]); }
    } finally {
      setDeletingId(null);
    }
  }

  function refreshFiles() {
    if (!activeDatasetId) return;
    client.get(`/api/datasets/${activeDatasetId}/files`)
      .then((res) => setFiles(res.data))
      .catch(() => {});
  }

  function refreshArticles() {
    if (!activeDatasetId) return;
    client.get(`/api/articles?dataset_id=${activeDatasetId}`)
      .then((res) => setArticles(res.data))
      .catch(() => {});
  }

  async function deleteArticle(id) {
    setDeletingArticleId(id);
    try {
      await client.delete(`/api/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingArticleId(null);
    }
  }

  function handleUploadSuccess() {
    refreshFiles();
    refreshArticles();
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Dataset selection */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Dataset</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Dataset'}
          </Button>
        </div>

        {showCreate && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Dataset name (e.g. March 2026)"
              onKeyDown={(e) => e.key === 'Enter' && createDataset()}
              className="flex-1 bg-[#0f1117] border border-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Button onClick={createDataset} disabled={creatingDataset || !newName.trim()} size="sm">
              {creatingDataset ? <Spinner size="sm" /> : 'Create'}
            </Button>
          </div>
        )}

        {loadingDs ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : datasets.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">No datasets yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {datasets.map((ds) => {
              const isActive = activeDatasetId === ds.id;
              const isDeleting = deletingId === ds.id;
              return (
                <div
                  key={ds.id}
                  className={`relative rounded-lg border transition-colors ${
                    isActive
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/40'
                  }`}
                >
                  <button
                    onClick={() => setActiveDatasetId(ds.id)}
                    className="w-full text-left px-4 py-3 pr-9"
                  >
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-gray-300'}`}>
                      {ds.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(ds.created_at).toLocaleDateString('en-SE')}
                    </p>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteDataset(ds.id); }}
                    disabled={isDeleting}
                    title="Delete dataset"
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    {isDeleting ? <Spinner size="sm" /> : '✕'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Uploaded files for active dataset */}
      {activeDatasetId && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Uploaded Files</h2>
          {loadingFiles ? (
            <div className="flex justify-center py-3"><Spinner /></div>
          ) : files.length === 0 ? (
            <p className="text-muted text-sm text-center py-3">No files uploaded to this dataset yet.</p>
          ) : (
            <div className="space-y-1">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f1117] border border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 text-sm shrink-0">📄</span>
                    <span className="text-sm text-gray-200 truncate">{f.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs text-muted">{f.rows_inserted} rows</span>
                    <span className="text-xs text-muted">
                      {new Date(f.uploaded_at).toLocaleDateString('en-SE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Articles list for active dataset */}
      {activeDatasetId && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">
            Articles
            {articles.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted">({articles.length})</span>
            )}
          </h2>
          {loadingArticles ? (
            <div className="flex justify-center py-3"><Spinner /></div>
          ) : articles.length === 0 ? (
            <p className="text-muted text-sm text-center py-3">No articles in this dataset yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-96 space-y-1 pr-1">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f1117] border border-border gap-3"
                >
                  <span className="text-sm text-gray-200 truncate min-w-0 flex-1" title={a.title}>
                    {a.title}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted">
                    <span>{new Date(a.published_at).toLocaleDateString('en-SE')}</span>
                    <span>{Number(a.views).toLocaleString()} views</span>
                    <span>{a.time_on_page}s</span>
                    <span>{a.conversions} conv.</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.source === 'manual'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-gray-700/60 text-gray-400'
                      }`}
                    >
                      {a.source}
                    </span>
                    <button
                      onClick={() => deleteArticle(a.id)}
                      disabled={deletingArticleId === a.id}
                      title="Remove article"
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      {deletingArticleId === a.id ? <Spinner size="sm" /> : '✕'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload tabs */}
      {activeDatasetId && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border">
            {['csv', 'manual'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t ? 'text-white border-b-2 border-accent -mb-px' : 'text-muted hover:text-white'
                }`}
              >
                {t === 'csv' ? '📄 CSV Upload' : '✏️ Manual Entry'}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === 'csv' ? (
              <CsvUploader
                datasetId={activeDatasetId}
                onSuccess={handleUploadSuccess}
              />
            ) : (
              <ManualEntryForm
                datasetId={activeDatasetId}
                onSuccess={handleUploadSuccess}
              />
            )}
          </div>
        </div>
      )}

      {!activeDatasetId && datasets.length > 0 && (
        <p className="text-muted text-sm text-center">Select a dataset above to upload data.</p>
      )}
    </div>
  );
}
