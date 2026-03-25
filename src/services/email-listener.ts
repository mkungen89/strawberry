import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { db } from '../lib/db';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

interface ParsedEmail {
  from: string;
  subject: string;
  body: string;
  date: Date;
  messageId: string;
  inReplyTo?: string;
}

export class EmailListener {
  private config: EmailConfig;

  constructor() {
    this.config = {
      user: process.env.EMAIL_ACCOUNT || '',
      password: process.env.EMAIL_PASSWORD || '',
      host: process.env.IMAP_HOST || 'mail.spacemail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
    };

    if (!this.config.user || !this.config.password) {
      throw new Error('Email credentials not configured in .env');
    }
  }

  /**
   * Fetch unread emails from inbox
   */
  async fetchUnreadEmails(): Promise<ParsedEmail[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: this.config.user,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.tls,
        tlsOptions: { rejectUnauthorized: false },
      });

      const emails: ParsedEmail[] = [];

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err) => {
          if (err) {
            reject(err);
            return;
          }

          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              reject(err);
              return;
            }

            if (results.length === 0) {
              console.log('[EmailListener] No unread emails');
              imap.end();
              resolve([]);
              return;
            }

            console.log(`[EmailListener] Found ${results.length} unread emails`);

            const fetch = imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg) => {
              msg.on('body', (stream: any) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error('[EmailListener] Parse error:', err);
                    return;
                  }

                  const from = parsed.from?.text || 'unknown@example.com';
                  const subject = parsed.subject || '(No Subject)';
                  const body = parsed.text || parsed.html || '';
                  const date = parsed.date || new Date();
                  const messageId = parsed.messageId || `${Date.now()}@vexcraft.io`;
                  const inReplyTo = parsed.inReplyTo || undefined;

                  emails.push({ from, subject, body, date, messageId, inReplyTo });
                });
              });

              msg.once('attributes', (attrs) => {
                const { uid } = attrs;
                // Mark as READ after processing
                imap.addFlags(uid, ['\\Seen'], (err) => {
                  if (err) console.error('[EmailListener] Failed to mark as read:', err);
                });
              });
            });

            fetch.once('end', () => {
              console.log('[EmailListener] Fetch complete');
              imap.end();
            });
          });
        });
      });

      imap.once('error', (err) => {
        console.error('[EmailListener] IMAP error:', err);
        reject(err);
      });

      imap.once('end', () => {
        console.log('[EmailListener] Connection ended');
        resolve(emails);
      });

      imap.connect();
    });
  }

  /**
   * Save email to database
   */
  async saveEmail(email: ParsedEmail) {
    // Check if we already processed this email
    const existing = await db.emailThread.findUnique({
      where: { messageId: email.messageId },
    });

    if (existing) {
      console.log(`[EmailListener] Email ${email.messageId} already exists, skipping`);
      return null;
    }

    const thread = await db.emailThread.create({
      data: {
        from: email.from,
        subject: email.subject,
        originalEmail: email.body,
        messageId: email.messageId,
        inReplyTo: email.inReplyTo,
        receivedAt: email.date,
        status: 'PENDING',
      },
    });

    console.log(`[EmailListener] Saved email ${thread.id} from ${email.from}`);
    return thread;
  }

  /**
   * Main polling function — call this every 5 minutes
   */
  async poll() {
    console.log('[EmailListener] Starting poll...');
    try {
      const emails = await this.fetchUnreadEmails();

      for (const email of emails) {
        await this.saveEmail(email);
      }

      console.log(`[EmailListener] Poll complete. Processed ${emails.length} emails.`);
    } catch (error) {
      console.error('[EmailListener] Poll failed:', error);
    }
  }
}

/**
 * Standalone runner for testing
 */
if (require.main === module) {
  const listener = new EmailListener();
  listener.poll().then(() => {
    console.log('[EmailListener] Manual poll complete');
    process.exit(0);
  });
}
