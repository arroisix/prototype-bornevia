// Mock reporting data. Values scale with the selected period so switching periods
// visibly changes the numbers.

export const PERIODS = ['Today', 'Last 7 days', 'Last Week', 'Last 30 days', 'This quarter'];

const PERIOD_FACTOR = { Today: 0.18, 'Last 7 days': 0.95, 'Last Week': 1, 'Last 30 days': 4.2, 'This quarter': 12.5 };
const PERIOD_POINTS = { Today: 12, 'Last 7 days': 7, 'Last Week': 7, 'Last 30 days': 10, 'This quarter': 12 };
const PERIOD_LABELS = {
  Today: ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p'],
  'Last 7 days': ['Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th'],
  'Last Week': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  'Last 30 days': ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28'],
  'This quarter': ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
};

// Base (one week) values per metric.
const METRICS = {
  received: { label: 'Tickets Received', unit: 'tickets', base: 412, change: '+8%', positive: true, shape: [92, 124, 87, 110, 77, 23, 53] },
  closed: { label: 'Tickets Closed', unit: 'tickets', base: 361, change: '-2%', positive: false, shape: [70, 101, 95, 98, 64, 30, 41] },
  response: { label: 'Avg First Response Time', unit: 'min', base: 5, change: '+12%', positive: true, shape: [6, 5, 4, 7, 5, 3, 4], isTime: true },
  replies: { label: 'Avg Replies per Day', unit: 'replies', base: 50, change: '-2%', positive: false, shape: [48, 62, 55, 51, 44, 30, 38] },
  traffic: { label: 'Highest Traffic Day', unit: '', base: 0, change: null, positive: null, shape: [92, 124, 87, 110, 77, 23, 53] },
};

export const METRIC_KEYS = ['received', 'closed', 'response', 'replies', 'traffic'];
export const CHART_METRICS = ['received', 'closed', 'replies'];

export const metricLabel = (key) => METRICS[key].label;

export function getOverview(period) {
  const f = PERIOD_FACTOR[period];
  const pct = (n) => `${Math.round(n)}%`;
  return [
    { key: 'received', value: pct(32 * Math.min(f, 1.4) + (f > 1 ? 4 : 0)), label: 'Tickets Received', change: '+8%', positive: true },
    { key: 'closed', value: pct(35 * Math.min(f, 1.3) + (f > 1 ? 3 : 0)), label: 'Tickets Closed', change: '-2%', positive: false },
    { key: 'response', value: `${Math.max(2, Math.round(5 * (f < 1 ? 1.2 : 1 / Math.sqrt(f) + 0.6)))} minutes`, label: 'Avg First Response Time', change: '+12%', positive: true },
    { key: 'replies', value: `${Math.round(50 * (f < 1 ? 0.4 : 1))} replies`, label: 'Avg Replies per Day', change: '-2%', positive: false },
    { key: 'traffic', value: period === 'Today' ? '2 PM' : 'Wednesday', label: period === 'Today' ? 'Busiest Hour' : 'Highest Traffic Day', change: null, positive: null },
  ];
}

/** Series for charts: [{ label, value }] */
export function getSeries(metricKey, period) {
  const m = METRICS[metricKey];
  const labels = PERIOD_LABELS[period];
  const f = metricKey === 'response' ? 1 : Math.max(PERIOD_FACTOR[period] / (PERIOD_POINTS[period] / 7), 0.12);
  return labels.map((label, i) => {
    const s = m.shape[i % m.shape.length];
    const wobble = 1 + Math.sin(i * 1.7 + metricKey.length) * 0.18;
    return { label, value: Math.max(1, Math.round(s * f * wobble)) };
  });
}

export function getBreakdown(metricKey) {
  const rows = [
    { channel: 'WhatsApp', share: 0.34 },
    { channel: 'Email', share: 0.22 },
    { channel: 'Instagram', share: 0.16 },
    { channel: 'Facebook', share: 0.12 },
    { channel: 'FB Messenger', share: 0.1 },
    { channel: 'Twitter', share: 0.06 },
  ];
  return metricKey === 'response'
    ? rows.map((r, i) => ({ ...r, display: `${(3 + i * 1.4).toFixed(1)}m` }))
    : rows.map((r) => ({ ...r, display: `${Math.round(r.share * 100)}%` }));
}

export const TOP_AGENTS = [
  { id: 'u13', value: '96 tickets', sub: 'CSAT 98%' },
  { id: 'u1', value: '88 tickets', sub: 'CSAT 95%' },
  { id: 'u8', value: '74 tickets', sub: 'CSAT 93%' },
  { id: 'u2', value: '69 tickets', sub: 'CSAT 94%' },
];

export const INSIGHTS = {
  received: 'Volume peaks on Monday mornings. Consider adding one more agent to Social Media between 9–11 AM.',
  closed: 'Closures dipped on Friday — 14 tickets were waiting on customer replies over the weekend.',
  response: 'First response got 12% faster after Technical Team added two agents last week.',
  replies: 'WhatsApp conversations need 30% more replies than Email to resolve.',
  traffic: 'Wednesday traffic is driven by the weekly billing reminder campaign.',
};
