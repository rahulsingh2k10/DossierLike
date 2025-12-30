import React from 'react';

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Img,
  Hr,
} from '@react-email/components';

export default function AutoReplyEmail({
  recipientName = 'there',
  year = new Date().getFullYear(),
}) {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(
      Body,
      { style: styles.body },
      React.createElement(
        Container,
        { style: styles.container },

        /* ================= HEADER ================= */
        React.createElement(
          Section,
          { style: styles.header },
          React.createElement(
            'div',
            { style: styles.headerInner },
            React.createElement(Img, {
              src: 'https://rahulsingh.ai/logo.png',
              width: 48,
              height: 48,
              alt: 'Rahul Singh',
              style: styles.logo,
            }),
            React.createElement(
              Heading,
              { style: styles.heading },
              'Appreciate You For Connecting With Me'
            )
          )
        ),

        /* ================= CONTENT ================= */
        React.createElement(
          Section,
          { style: styles.content },

          React.createElement(
            Text,
            { style: styles.paragraph },
            `Hi ${recipientName},`
          ),

          React.createElement(
            Text,
            { style: styles.paragraph },
            'I appreciate you reaching out and taking the proactive step to connect with me.'
          ),

          React.createElement(
            Text,
            { style: styles.paragraph },
            'I have received your email and will review it at the earliest opportunity. In the meantime, I’d be happy to connect with you on LinkedIn so we can stay in touch, exchange insights, and learn more about each other’s work.'
          ),

          React.createElement(
            Text,
            { style: styles.paragraph },
            React.createElement(
              Link,
              {
                href: 'https://www.linkedin.com/in/rahulsingh05/',
                style: styles.link,
              },
              'View my LinkedIn profile'
            )
          ),

          React.createElement(
            Text,
            { style: styles.signature },
            'I look forward to continuing our conversation soon.',
            React.createElement('br'),
            React.createElement('br'),
            React.createElement('span', null, 'Thanks And Regards,'),
            React.createElement('br'),
            React.createElement('strong', null, 'Rahul Singh')
          )
        ),

        React.createElement(Hr, { style: styles.divider }),

        /* ================= FOOTER ================= */
        React.createElement(
          Section,
          { style: styles.footer },
          React.createElement(
            Text,
            null,
            'This is an automated message to confirm that your message has been received.'
          ),
          React.createElement(
            Text,
            null,
            `${year} Rahul Singh. All Rights Reserved.`
          )
        )
      )
    )
  );
}

/* ================= STYLES ================= */

const styles = {
  body: {
    backgroundColor: '#f4f6f8',
    padding: '24px',
    fontFamily: 'Inter, Arial, sans-serif',
  },

  container: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },

  /* Header */
  header: {
    padding: '20px 24px',
    backgroundColor: '#4f46e5',
    textAlign: 'center',
  },

  headerInner: {
    display: 'inline-block',
    textAlign: 'center',
  },

  logo: {
    display: 'block',
    margin: '0 auto 8px auto',
  },

  heading: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
  },

  /* Content */
  content: {
    padding: '24px',
    color: '#111827',
    fontSize: '14px',
    lineHeight: '1.6',
  },

  paragraph: {
    marginBottom: '14px',
  },

  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: 500,
  },

  signature: {
    marginTop: '20px',
    fontSize: '14px',
  },

  divider: {
    borderColor: '#e5e7eb',
  },

  /* Footer */
  footer: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#6b7280',
  },
};
