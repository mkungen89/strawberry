const Imap = require('imap');

const imap = new Imap({
  user: 'support@vexcraft.io',
  password: '6KcJ8LqTh@z9NAL',
  host: 'mail.spacemail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

console.log('🔄 Trying to connect...');

imap.on('ready', () => {
  console.log('✅ IMAP Connected!');
  imap.end();
});

imap.on('error', (err) => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});

imap.on('end', () => {
  console.log('Connection ended');
});

imap.connect();

setTimeout(() => {
  console.log('⏱️ Timeout — connection took too long');
  process.exit(1);
}, 10000);
