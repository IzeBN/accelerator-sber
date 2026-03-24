import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { getDocuments, reviewDocument } from '../../api/client';
import { Document } from '../../types';
import { PageTransition } from '../../components/PageTransition';
import styles from './Admin.module.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'На проверке',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function DocumentReview() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = (status: string) => {
    setLoading(true);
    getDocuments(status || undefined).then(setDocs).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const approve = async (doc: Document) => {
    setSaving(true);
    try {
      const updated = await reviewDocument(doc.id, 'approved');
      setDocs((prev) => prev.map((d) => d.id === updated.id ? updated : d));
    } catch {}
    setSaving(false);
  };

  const reject = async () => {
    if (!rejectModal) return;
    setSaving(true);
    try {
      const updated = await reviewDocument(rejectModal.id, 'rejected', rejectReason);
      setDocs((prev) => prev.map((d) => d.id === updated.id ? updated : d));
      setRejectModal(null);
      setRejectReason('');
    } catch {}
    setSaving(false);
  };

  return (
    <PageTransition>
    <div className={styles.page}>
      <h1 className={styles.title}>Модерация справок</h1>

      <div className={styles.filterRow}>
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card">
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Нет документов со статусом «{STATUS_LABELS[filter]}»
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Студент ID</th>
                  <th>Тип документа</th>
                  <th>Дата подачи</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>#{doc.id}</td>
                    <td>#{doc.user_id}</td>
                    <td>{doc.doc_type === 'student_id' ? 'Студенческий билет' : doc.doc_type}</td>
                    <td>{new Date(doc.submitted_at).toLocaleDateString('ru-RU')}</td>
                    <td><span className={`badge ${STATUS_BADGE[doc.status]}`}>{STATUS_LABELS[doc.status]}</span></td>
                    <td>
                      {doc.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => approve(doc)} disabled={saving}>
                            <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            Одобрить
                          </button>
                          <button className="btn btn-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }}
                            onClick={() => { setRejectModal(doc); setRejectReason(''); }}>
                            <X size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            Отклонить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Отклонить документ #{rejectModal.id}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
              Укажите причину отклонения — студент получит уведомление
            </p>
            <textarea
              className="input"
              rows={3}
              placeholder="Причина отклонения..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setRejectModal(null)}>Отмена</button>
              <button
                className="btn btn-sm"
                style={{ flex: 1, background: 'var(--red)', color: 'white', borderRadius: 8, fontWeight: 600 }}
                onClick={reject}
                disabled={saving || !rejectReason}
              >
                {saving ? 'Отклоняем...' : 'Отклонить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
