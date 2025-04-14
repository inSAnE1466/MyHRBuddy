// src/lib/email-service.ts
import axios from 'axios';

/**
 * Twilio SendGrid Email Service
 * 
 * A simple service for sending emails using Twilio SendGrid
 * instead of relying on Gmail MCP integration
 */

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Send an email using Twilio SendGrid
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    // Prepare recipient format for SendGrid
    const toEmails = Array.isArray(params.to)
      ? params.to.map(email => ({ email }))
      : [{ email: params.to }];

    // Format CC if provided
    const ccEmails = params.cc
      ? Array.isArray(params.cc)
        ? params.cc.map(email => ({ email }))
        : [{ email: params.cc }]
      : undefined;

    // Format BCC if provided
    const bccEmails = params.bcc
      ? Array.isArray(params.bcc)
        ? params.bcc.map(email => ({ email }))
        : [{ email: params.bcc }]
      : undefined;

    // Use the configured sender or default to environment variable
    const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('Sender email not configured');
    }

    // Prepare the request payload
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

    // Send the email using SendGrid's API
    const response = await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
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
