import axios from 'axios';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const toEmails = Array.isArray(params.to)
      ? params.to.map(email => ({ email }))
      : [{ email: params.to }];

    const ccEmails = params.cc
      ? Array.isArray(params.cc)
        ? params.cc.map(email => ({ email }))
        : [{ email: params.cc }]
      : undefined;

    const bccEmails = params.bcc
      ? Array.isArray(params.bcc)
        ? params.bcc.map(email => ({ email }))
        : [{ email: params.bcc }]
      : undefined;

    const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('Sender email not configured');
    }

    const data = {
      personalizations: [
        {
          to: toEmails,
          cc: ccEmails,
          bcc: bccEmails,
          subject: params.subject,
        },
      ],
      from: { email: fromEmail },
      reply_to: params.replyTo ? { email: params.replyTo } : undefined,
      content: [
        {
          type: 'text/html',
          value: params.html,
        },
      ],
    };

    await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
