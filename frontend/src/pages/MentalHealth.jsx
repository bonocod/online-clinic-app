import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
const MentalHealth = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([{ text: t('mentalHealth.botGreeting'), isBot: true }]);
  const [input, setInput] = useState('');
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    // Simple bot response
    let response = 'Thank you for sharing. Remember to take care of yourself.';
    if (input.toLowerCase().includes('sad')) response = 'I\'m sorry you\'re feeling sad. Try some deep breathing.';
    setMessages(prev => [...prev, { text: response, isBot: true }]);
    setInput('');
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4 glass-card min-h-[70vh] flex flex-col"
    >
      <h1 className="text-2xl font-bold mb-4 text-center">{t('mentalHealth.title')}</h1>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-xl ${msg.isBot ? 'bg-neutral text-left' : 'bg-primary text-white text-right'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('mentalHealth.placeholder')}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="input-field flex-1"
        />
        <button onClick={handleSend} className="btn-primary px-4">
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
};
export default MentalHealth;