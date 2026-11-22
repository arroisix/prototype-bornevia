// Mock media library + reply templates used by the ticket chat composer.

export const MOCK_PHOTOS = [
  { id: 'p1', type: 'image', name: 'speedtest.jpg', size: '182 KB', source: require('../../assets/mock/photo_speedtest.jpg') },
  { id: 'p2', type: 'image', name: 'router.jpg', size: '96 KB', source: require('../../assets/mock/photo_router.jpg') },
  { id: 'p3', type: 'image', name: 'error-404.jpg', size: '174 KB', source: require('../../assets/mock/photo_error.jpg') },
  { id: 'p4', type: 'image', name: 'invoice.jpg', size: '157 KB', source: require('../../assets/mock/photo_invoice.jpg') },
  { id: 'p5', type: 'image', name: 'wifi-settings.jpg', size: '170 KB', source: require('../../assets/mock/photo_wifi.jpg') },
  { id: 'p6', type: 'image', name: 'cable.jpg', size: '107 KB', source: require('../../assets/mock/photo_cable.jpg') },
];

export const MOCK_VIDEOS = [
  { id: 'v1', type: 'video', name: 'router-blinking.mp4', size: '4.2 MB', duration: '0:12', source: require('../../assets/mock/video_router_blinking.jpg') },
  { id: 'v2', type: 'video', name: 'buffering.mp4', size: '8.9 MB', duration: '0:34', source: require('../../assets/mock/video_buffering.jpg') },
  { id: 'v3', type: 'video', name: 'how-to-reset.mp4', size: '15.1 MB', duration: '1:05', source: require('../../assets/mock/video_screen_recording.jpg') },
];

// {name} and {ticket} are filled in when a template is inserted.
export const REPLY_TEMPLATES = [
  {
    id: 't1',
    title: 'Greeting',
    category: 'General',
    body: 'Hi {name}, thanks for reaching out to Bornevia Support! I\'m looking into your ticket {ticket} right now and will get back to you shortly.',
  },
  {
    id: 't2',
    title: 'Ask for customer ID',
    category: 'Verification',
    body: 'Hi {name}, to help you faster, could you please share your **customer ID** and the **registered phone number** on your account?',
  },
  {
    id: 't3',
    title: 'Basic troubleshooting',
    category: 'Technical',
    body: 'Please try these steps:\n1. Turn off your router for 30 seconds\n2. Turn it back on and wait until the lights are stable\n3. Run a speed test and share the result with us',
  },
  {
    id: 't4',
    title: 'Escalated to network team',
    category: 'Technical',
    body: 'Thanks for your patience, {name}. I\'ve escalated ticket {ticket} to our _network team_. They will monitor your line and we\'ll update you within **24 hours**.',
  },
  {
    id: 't5',
    title: 'Issue resolved',
    category: 'Closing',
    body: 'Glad to hear everything is working again, {name}! I\'ll mark ticket {ticket} as resolved. Feel free to reach out anytime if you need more help.',
  },
];

export const fillTemplate = (body, { name, ticket }) =>
  body.replace(/\{name\}/g, name).replace(/\{ticket\}/g, ticket);
