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
    React.createElement(Head, null),
    React.createElement(
      Body,
      { style: styles.body },

      React.createElement(
        Container,
        { style: styles.container },

        /* =====================
           HEADER
        ===================== */
        React.createElement(
          Section,
          { style: styles.header },

          React.createElement(
            'table',
            { width: '100%', cellPadding: 0, cellSpacing: 0 },
            React.createElement(
              'tr',
              null,

              // Logo (Top Left)
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

              // Title
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

        /* =====================
           CONTENT
        ===================== */
        React.createElement(
          Section,
          { style: styles.content },

          React.createElement(Text, { style: styles.label }, 'From'),
          React.createElement(Text, { style: styles.value }, name),

          React.createElement(Text, { style: styles.label }, 'Email'),
          React.createElement(
            Text,
            { style: styles.value },
            React.createElement(
              Link,
              { href: `mailto:${email}`, style: styles.link },
              email
            )
          ),

          React.createElement(Text, { style: styles.label }, 'Subject'),
          React.createElement(Text, { style: styles.value }, subject),

          React.createElement(Hr, { style: styles.divider }),

          React.createElement(
            Section,
            { style: styles.messageBox },
            React.createElement(Text, { style: styles.messageText }, message)
          )
        ),

        /* =====================
           FOOTER
        ===================== */
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
            { style: styles.footerTextMuted },
            `© ${year} Rahul Singh. All rights reserved.`
          )
        )
      )
    )
  );
}

/* =====================
   STYLES
===================== */
const styles = {
  body: {
    backgroundColor: '#0b0f1a',
    padding: '32px',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },

  container: {
    maxWidth: '600px',
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
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
    verticalAlign: 'middle',
    paddingLeft: '12px',
  },

  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#ffffff',
  },

  /* Content */
  content: {
    padding: '28px',
    color: '#e5e7eb',
  },

  label: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#9ca3af',
    marginBottom: '4px',
  },

  value: {
    fontSize: '15px',
    marginTop: 0,
    marginBottom: '16px',
    color: '#f9fafb',
  },

  link: {
    color: '#a78bfa',
    textDecoration: 'none',
  },

  divider: {
    borderColor: '#1f2937',
    margin: '24px 0',
  },

  messageBox: {
    backgroundColor: '#020617',
    borderLeft: '4px solid #7c3aed',
    padding: '18px',
    borderRadius: '8px',
  },

  messageText: {
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    color: '#e5e7eb',
    margin: 0,
  },

  /* Footer */
  footer: {
    backgroundColor: '#020617',
    padding: '18px',
    textAlign: 'center',
  },

  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },

  footerTextMuted: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '6px',
  },
};
