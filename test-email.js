const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imap = new Imap({
  user: 'support@vexcraft.io',
  password: '6KcJ8LqTh@z9NAL',
  host: 'mail.spacemail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.openBox('INBOX', false, (err, box) => {
  if (err) {
    console.log('❌ IMAP Error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to INBOX');
  console.log('Total emails:', box.messages.total);
  console.log('Unread emails:', box.messages.unseen);
  imap.end();
});

imap.openBox('INBOX', false, () => {});
imap.connect();
