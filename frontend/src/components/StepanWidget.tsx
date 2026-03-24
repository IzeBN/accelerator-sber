import { useEffect, useRef, useState } from 'react';
import { Bot, X, SendHorizonal } from 'lucide-react';
import { api, getStepanTips } from '../api/client';
import { Tip } from '../types';
import styles from './StepanWidget.module.css';

interface Message {
  from: 'stepan' | 'user';
  text: string;
}

export default function StepanWidget({ onClose }: { onClose: () => void }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStepanTips().then((data: Tip[]) => {
      setTips(data);
      if (data.length > 0) {
        setMessages([{ from: 'stepan', text: data[0].text }]);
      } else {
        setMessages([{ from: 'stepan', text: 'Привет! Я Степан — твой финансовый помощник 🤖 Чем могу помочь?' }]);
      }
    }).catch(() => {
      setMessages([{ from: 'stepan', text: 'Привет! Я Степан — твой финансовый помощник 🤖' }]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { from: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Build history: skip the very first tip message (index 0 from stepan), send the rest
    const history = updatedMessages.slice(1).map((m) => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const { data } = await api.post('/stepan/chat', { message: text, history });
      setMessages((prev) => [...prev, { from: 'stepan', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: 'stepan',
          text: 'Что-то пошло не так. Попробуй ещё раз чуть позже 😊',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.avatar}><Bot size={20} /></span>
          <div>
            <div className={styles.name}>Степан</div>
            <div className={styles.status}>
              {loading ? 'Степан думает...' : 'Финансовый помощник'}
            </div>
          </div>
        </div>
        <button className={styles.close} onClick={onClose}><X size={16} /></button>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.from === 'user' ? styles.msgUser : styles.msgStepan}`}>
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className={`${styles.msg} ${styles.msgStepan}`}>
            <span className={styles.loadingDots}>
              <span /><span /><span />
            </span>
          </div>
        )}

        {!loading && tips.length > 1 && messages.length <= 2 && (
          <div className={styles.tipsSection}>
            <div className={styles.tipsLabel}>Советы дня:</div>
            {tips.slice(1, 3).map((tip) => (
              <button
                key={tip.id}
                className={styles.tipBtn}
                onClick={() => {
                  setMessages((prev) => [...prev, { from: 'stepan', text: tip.text }]);
                }}
              >
                {tip.text.slice(0, 60)}...
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спросить Степана..."
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className={styles.sendBtn}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          <SendHorizonal size={16} />
        </button>
      </div>
    </div>
  );
}
