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
  Button,
  Img,
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
              width: 36,
              height: 36,
              alt: 'Rahul Singh',
              style: styles.logo,
            }),
            React.createElement(
              Heading,
              { style: styles.heading },
              'Let\'s Connect Submission'
            )
          )
        ),

        /* ================= CONTENT ================= */
        React.createElement(
          Section,
          { style: styles.content },
          React.createElement(Text, null, `Name: ${name}`),
          React.createElement(
            Text,
            null,
            'Email: ',
            React.createElement(
              Link,
              { href: `mailto:${email}`, style: styles.link },
              email
            )
          ),
          React.createElement(Text, null, `Subject: ${subject}`),

          React.createElement(
            Section,
            { style: styles.messageBox },
            React.createElement(
              Text,
              { style: styles.messageText },
              message
            )
          )
        ),

        /* ================= FOOTER ================= */
        React.createElement(
          Section,
          { style: styles.footer },
          React.createElement(
            Text,
            null,
            'This email was sent from your portfolio website.'
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

  link: {
    color: '#4f46e5',
    textDecoration: 'none',
  },

  messageBox: {
    backgroundColor: '#f1f3f5',
    padding: '16px',
    borderLeft: '4px solid #4f46e5',
    marginTop: '16px',
    borderRadius: '4px',
  },

  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
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
