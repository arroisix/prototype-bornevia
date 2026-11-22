// Mock "AI" used by the prototype. Produces a reply draft from the conversation and
// transforms it for the improve actions. Swap for a real API call later.

const firstName = (username) => username.replace('@', '').split(/[\s_]+/)[0];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const splitSentences = (text) =>
  text
    .replace(/\n+/g, ' ')
    .replace(/([.!?])\s+/g, '$1\u0000')
    .split('\u0000')
    .map((s) => s.trim())
    .filter(Boolean);

export function generateDraft(ticket, messages) {
  const name = cap(firstName(ticket.username));
  const lastCustomer = [...messages].reverse().find((m) => m.from === 'customer');
  const text = (lastCustomer?.text || ticket.message).toLowerCase();

  if (/thank|thanks|perfect|nice|great|🙏/.test(text)) {
    return `Hi ${name}, you're very welcome! I'm glad we could help. I'll keep this ticket open for the next **24 hours** in case anything comes up. Have a great day!`;
  }
  if (/slow|speed|crawl|sluggish|mbps|buffer/.test(text)) {
    return `Hi ${name}, sorry about the slow connection. I've checked your line and found some congestion in your area. Our team is already working on it, and speeds should be back to normal within **2 hours**. Could you run a speed test afterwards and share the result?`;
  }
  if (/charge|refund|invoice|bill/.test(text)) {
    return `Hi ${name}, thanks for flagging this. I can see the duplicate charge on your account and I've submitted a **refund request**. It usually takes 3–5 business days to appear on your statement.`;
  }
  if (/password|login|account|access/.test(text)) {
    return `Hi ${name}, no worries. I've sent a password reset link to your registered email. Please check your inbox (and spam folder) and let me know if it doesn't arrive within 5 minutes.`;
  }
  return `Hi ${name}, thanks for the details. I've reviewed your ticket and I'm looking into it right now. I'll get back to you with an update shortly. Is there anything else you'd like me to check in the meantime?`;
}

export const IMPROVE_ACTIONS = [
  { id: 'shorter', label: 'Shorter', busy: 'Making it shorter…' },
  { id: 'friendly', label: 'Friendlier', busy: 'Making it friendlier…' },
  { id: 'formal', label: 'More formal', busy: 'Making it more formal…' },
  { id: 'grammar', label: 'Fix grammar', busy: 'Fixing grammar…' },
  { id: 'bullets', label: 'Bullet points', busy: 'Turning into bullet points…' },
  { id: 'indonesian', label: 'Bahasa Indonesia', busy: 'Translating…' },
];

const stripGreeting = (text) => text.replace(/^(hi|hey|hello|dear)\s+[^,]+,\s*/i, '').replace(/\n*kind regards,[\s\S]*$/i, '').trim();
const getGreetingName = (text, fallback) => {
  const m = text.match(/^(?:hi|hey|hello|dear)\s+([^,!]+)[,!]/i);
  return m ? m[1].trim() : fallback;
};

export function improveDraft(text, action, ticket, instruction = '') {
  const name = getGreetingName(text, cap(firstName(ticket.username)));
  const body = cap(stripGreeting(text));
  const sentences = splitSentences(body);

  switch (action) {
    case 'shorter':
      return `Hi ${name}, ${sentences.slice(0, 2).join(' ')}`;
    case 'friendly':
      return `Hey ${name}! 😊 ${body.replace(/\bsorry\b/i, 'so sorry')} We've got your back!`;
    case 'formal':
      return `Dear ${name},\n\n${body.replace(/\bno worries\b/i, 'certainly')}\n\nKind regards,\nBornevia Support`;
    case 'grammar':
      return `Hi ${name}, ${sentences.map((s) => cap(s.replace(/\s+/g, ' '))).join(' ')}`;
    case 'bullets':
      return `Hi ${name},\n${sentences.map((s) => `- ${s}`).join('\n')}`;
    case 'indonesian':
      return `Halo ${name}, terima kasih sudah menghubungi kami. Kami sudah mengecek tiket Anda dan tim kami sedang menanganinya. Kami akan memberi kabar **secepatnya**. Ada lagi yang bisa kami bantu?`;
    case 'custom': {
      const ins = instruction.toLowerCase();
      if (/short|singkat|pendek/.test(ins)) return improveDraft(text, 'shorter', ticket);
      if (/formal/.test(ins)) return improveDraft(text, 'formal', ticket);
      if (/friend|casual|santai|ramah/.test(ins)) return improveDraft(text, 'friendly', ticket);
      if (/bullet|list|poin/.test(ins)) return improveDraft(text, 'bullets', ticket);
      if (/indonesia|bahasa/.test(ins)) return improveDraft(text, 'indonesian', ticket);
      if (/discount|compensat|voucher|kompensasi/.test(ins)) {
        return `${text}\n\nAs an apology for the inconvenience, we've added a **10% discount** to your next bill.`;
      }
      return `${text}\n\n${cap(instruction.replace(/[.!]*$/, ''))}.`;
    }
    default:
      return text;
  }
}
