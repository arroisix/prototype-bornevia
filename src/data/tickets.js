// Mock ticket list (25 tickets).
// Generate 25 dummy tickets
const channels = ['Twitter', 'Facebook', 'FB Messenger', 'Instagram', 'WhatsApp', 'Email'];
const usernames = [
  '@michael_greek', '@internet_cool', 'Mary Thompson', 'Jane Wilson', 'Emma Thompson',
  'Nina Suryana', '@tech_guru', 'John Smith', '@social_butterfly', 'Lisa Anderson',
  '@quick_help', 'Robert Brown', '@digital_nomad', 'Sarah Connor', '@customer_first',
  'David Lee', '@happy_user', 'Michelle Obama', '@speed_racer', 'Chris Evans',
  '@feedback_king', 'Amanda White', '@loyal_customer', 'James Bond', '@support_seeker'
];
const messages = [
  '@ISPCompany, internet crawling today. Any solutions? #NeedSpeed',
  'Hey @ISPCompany, experiencing sluggish internet. Any solutions?',
  'Hi @ISPCompany, I\'ve been facing really slow internet speeds lately. Can you ple...',
  'Seriously @ISPCompany, what\'s going on with your internet?! It\'s been painfully slo...',
  'Hey there! I just tried to purchase a new internet subscription on your website, bu...',
  'Yeah! You\'re right.',
  'My connection keeps dropping every few minutes. Please help!',
  'When will the maintenance be completed? It\'s been 3 hours already.',
  'Thank you for the quick response! Really appreciate it.',
  'I need to upgrade my plan. How do I do that?',
  'The mobile app is not working properly. Getting error 404.',
  'Can someone help me reset my password? Urgent!',
  'Your service has been excellent lately. Keep it up!',
  'I was charged twice for my subscription. Please refund.',
  'How do I cancel my subscription? Can\'t find the option.',
  'The speed test shows 10mbps but I\'m paying for 100mbps!',
  'Great customer service experience today. Thanks team!',
  'My router is blinking red. What does that mean?',
  'Need technical support for setting up mesh network.',
  'Invoice not received for this month. Please resend.',
  'Website is down. Cannot access my account dashboard.',
  'Fiber installation scheduled for next week. Excited!',
  'Billing address needs to be updated. How to change?',
  'Excellent service! Recommended to all my friends.',
  'Connection timeout error when streaming. Please fix.',
];

export const initialTickets = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  username: usernames[i],
  channel: channels[i % channels.length],
  message: messages[i],
  time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}));
