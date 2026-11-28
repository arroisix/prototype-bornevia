// Mock teams + people directory for the Teams tab and team detail.

export const PEOPLE = [
  { id: 'u1', name: 'Andrew Lim', role: 'Team Lead', color: '#FF6B6B', status: 'online' },
  { id: 'u2', name: 'Susan Park', role: 'Agent', color: '#4ECDC4', status: 'online' },
  { id: 'u3', name: 'James Carter', role: 'Agent', color: '#45B7D1', status: 'away' },
  { id: 'u4', name: 'Margareth Tan', role: 'Team Lead', color: '#96CEB4', status: 'online' },
  { id: 'u5', name: 'Bianca Rossi', role: 'Agent', color: '#E5B94E', status: 'offline' },
  { id: 'u6', name: 'Steve Nolan', role: 'Agent', color: '#DDA0DD', status: 'online' },
  { id: 'u7', name: 'David Kim', role: 'Senior Agent', color: '#87CEEB', status: 'away' },
  { id: 'u8', name: 'Michael Chen', role: 'Agent', color: '#C9B458', status: 'online' },
  { id: 'u9', name: 'Kowalski Nowak', role: 'Agent', color: '#BB8FCE', status: 'offline' },
  { id: 'u10', name: 'Nina Suryana', role: 'Team Lead', color: '#98D8C8', status: 'online' },
  { id: 'u11', name: 'Ali Rahman', role: 'Agent', color: '#F5B041', status: 'online' },
  { id: 'u12', name: 'Mina Sato', role: 'Agent', color: '#EC7063', status: 'away' },
  { id: 'u13', name: 'Anna Putri', role: 'Senior Agent', color: '#5DADE2', status: 'online' },
  { id: 'u14', name: 'Budi Santoso', role: 'Agent', color: '#58D68D', status: 'offline' },
  { id: 'u15', name: 'Citra Lestari', role: 'Agent', color: '#F1948A', status: 'online' },
];

const pick = (...ids) => ids.map((id, i) => ({ id, load: [7, 4, 9, 3, 6, 2, 8, 5][i % 8] }));

export const initialTeams = [
  {
    id: 't1',
    name: 'Social Media',
    color: '#1877F2',
    description: 'Handles Twitter, Facebook and Instagram mentions',
    channels: ['Twitter', 'Facebook', 'Instagram'],
    members: pick('u1', 'u2', 'u3', 'u13', 'u15'),
    extraMembers: 6,
    stats: { open: 24, response: '4m 12s', csat: '94%', responseDelta: '-8%', csatDelta: '+2%' },
  },
  {
    id: 't2',
    name: 'Sales Team',
    color: '#1DA851',
    description: 'Upgrades, new subscriptions and plan questions',
    channels: ['WhatsApp', 'Email'],
    members: pick('u4', 'u5', 'u6', 'u11'),
    extraMembers: 10,
    stats: { open: 11, response: '6m 40s', csat: '91%', responseDelta: '+4%', csatDelta: '+1%' },
  },
  {
    id: 't3',
    name: 'Technical Team',
    color: '#EE6A23',
    description: 'Connectivity, routers and outage escalations',
    channels: ['Email', 'WhatsApp', 'FB Messenger'],
    members: pick('u7', 'u8', 'u9', 'u14'),
    extraMembers: 10,
    stats: { open: 37, response: '9m 05s', csat: '88%', responseDelta: '+12%', csatDelta: '-3%' },
  },
  {
    id: 't4',
    name: 'Marketing',
    color: '#D62976',
    description: 'Campaign replies and community engagement',
    channels: ['Instagram', 'Twitter'],
    members: pick('u10', 'u11', 'u12'),
    extraMembers: 11,
    stats: { open: 6, response: '12m 30s', csat: '96%', responseDelta: '-5%', csatDelta: '+4%' },
  },
  {
    id: 't5',
    name: 'Customer Service',
    color: '#14171A',
    description: 'General enquiries across every channel',
    channels: ['Email', 'WhatsApp', 'Facebook', 'FB Messenger', 'Instagram', 'Twitter'],
    members: pick('u7', 'u8', 'u13', 'u15', 'u2'),
    extraMembers: 9,
    stats: { open: 52, response: '5m 18s', csat: '92%', responseDelta: '-3%', csatDelta: '+1%' },
  },
];

export const TEAM_ACTIVITY = [
  { id: 'a1', who: 'Andrew Lim', what: 'resolved ticket #1004', when: '5m ago', type: 'resolved' },
  { id: 'a2', who: 'Susan Park', what: 'replied to @internet_cool', when: '18m ago', type: 'reply' },
  { id: 'a3', who: 'System', what: 'assigned 3 new tickets to the team', when: '1h ago', type: 'assign' },
  { id: 'a4', who: 'Anna Putri', what: 'joined the team', when: 'Yesterday', type: 'member' },
  { id: 'a5', who: 'James Carter', what: 'escalated ticket #1011 to Technical', when: 'Yesterday', type: 'escalate' },
];

export const personById = (id) => PEOPLE.find((p) => p.id === id);

export const initialsOf = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
