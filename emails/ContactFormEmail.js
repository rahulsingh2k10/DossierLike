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

export default function ContactFormEmail({
  name,
  email,
  subject,
  message,
  year,
}) {
  return React.createElement(
    Html,
    { lang: 'en' },
    React.createElement(
      Head,
      null,
      React.createElement('meta', {
        name: 'color-scheme',
        content: 'light dark',
      }),
      React.createElement('meta', {
        name: 'supported-color-schemes',
        content: 'light dark',
      })
    ),
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
            'table',
            { width: '100%', cellPadding: 0, cellSpacing: 0 },
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                { style: styles.logoCell },
                React.createElement(Img, {
                  src: 'https://rahulsingh.ai/logo.png',
                  width: 36,
                  height: 36,
                  alt: 'Rahul Singh',
                  style: styles.logo,
                })
              ),
              React.createElement(
                'td',
                { style: styles.headerTextCell },
                React.createElement(
                  Heading,
                  { style: styles.headerTitle },
                  'New Contact Submission'
                )
              )
            )
          )
        ),

        /* ================= CONTENT ================= */
        React.createElement(
          Section,
          { style: styles.content },

          labelValue('From', name),
          labelValue(
            'Email',
            React.createElement(
              Link,
              { href: `mailto:${email}`, style: styles.link },
              email
            )
          ),
          labelValue('Subject', subject),

          React.createElement(Hr, { style: styles.divider }),

          React.createElement(
            Section,
            { style: styles.messageBox },
            React.createElement(Text, { style: styles.messageText }, message)
          )
        ),

        /* ================= FOOTER ================= */
        React.createElement(
          Section,
          { style: styles.footer },
          React.createElement(
            Text,
            { style: styles.footerText },
            'This message was sent from your portfolio contact form.'
          ),
          React.createElement(
            Text,
            { style: styles.footerMuted },
            `© ${year} Rahul Singh. All rights reserved.`
          )
        )
      )
    )
  );
}

/* ================= Helpers ================= */
function labelValue(label, value) {
  return React.createElement(
    Section,
    { style: styles.block },
    React.createElement(Text, { style: styles.label }, label),
    React.createElement(Text, { style: styles.value }, value)
  );
}

/* ================= Styles ================= */
const styles = {
  body: {
    backgroundColor: '#f4f6f8',
    color: '#111827',
    padding: '32px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  container: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    overflow: 'hidden',
    maxWidth: '600px',
  },

  /* Header */
  header: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    padding: '20px 24px',
  },

  logoCell: {
    width: '44px',
    verticalAlign: 'middle',
  },

  logo: {
    borderRadius: '8px',
  },

  headerTextCell: {
    paddingLeft: '12px',
    verticalAlign: 'middle',
  },

  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#ffffff',
    WebkitTextFillColor: '#ffffff',
  },

  /* Content */
  content: {
    padding: '28px',
    backgroundColor: '#ffffff',
    color: '#111827',
  },

  block: {
    marginBottom: '16px',
  },

  label: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6b7280',
  },

  value: {
    fontSize: '15px',
    color: '#111827',
    margin: 0,
    WebkitTextFillColor: '#111827',
  },

  link: {
    color: '#4f46e5',
    textDecoration: 'none',
  },

  divider: {
    borderColor: '#e5e7eb',
    margin: '24px 0',
  },

  messageBox: {
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #7c3aed',
    padding: '16px',
    borderRadius: '8px',
  },

  messageText: {
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    color: '#111827',
  },

  /* Footer */
  footer: {
    backgroundColor: '#f9fafb',
    padding: '18px',
    textAlign: 'center',
  },

  footerText: {
    fontSize: '12px',
    color: '#6b7280',
  },

  footerMuted: {
    fontSize: '11px',
    color: '#9ca3af',
  },
};
