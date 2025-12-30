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

        /* ========= Header ========= */
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
			  'New Form Submission'
			)
		  )
		)


        /* ========= Content ========= */
        React.createElement(
          Section,
          { style: styles.content },

          infoRow('Name', name),
          infoRow(
            'Email',
            React.createElement(
              Link,
              { href: `mailto:${email}`, style: styles.link },
              email
            )
          ),
          infoRow('Subject', subject),

          React.createElement(Hr, { style: styles.divider }),

          React.createElement(
            Section,
            { style: styles.messageBox },
            React.createElement(Text, { style: styles.message }, message)
          )
        ),

        /* ========= Footer ========= */
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
            `${year} Rahul Singh. All rights reserved.`
          )
        )
      )
    )
  );
}

/* ========= Helper ========= */
function infoRow(label, value) {
  return React.createElement(
    Section,
    { style: styles.row },
    React.createElement(Text, { style: styles.label }, label),
    React.createElement(Text, { style: styles.value }, value)
  );
}

/* ========= Theme ========= */
const BRAND = '#4f46e5'; // your original indigo theme

const styles = {
  body: {
    backgroundColor: '#f4f6f8',
    padding: '32px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  container: {
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },

  /* Header */
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'center',
  },

  headerInner: {
    display: 'inline-block',
    textAlign: 'center',
  },

  logo: {
    display: 'inline-block',
    marginBottom: '8px',
  },
  
  heading: {
    display: 'inline-block',
    margin: 0,
    fontSize: '18px',
  fontWeight: 600,
    color: '#111827',
  },

  /* Content */
  content: {
    padding: '24px',
  },

  row: {
    marginBottom: '14px',
  },

  label: {
    fontSize: '12px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: '2px',
  },

  value: {
    fontSize: '15px',
    color: '#111827',
    margin: 0,
  },

  link: {
    color: BRAND,
    textDecoration: 'none',
    fontWeight: 500,
  },

  divider: {
    borderColor: '#e5e7eb',
    margin: '20px 0',
  },

  messageBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderLeft: `4px solid ${BRAND}`,
    borderRadius: '8px',
    padding: '16px',
  },

  message: {
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    color: '#111827',
    margin: 0,
  },

  /* Footer */
  footer: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
  },

  footerText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },

  footerMuted: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px',
  },
};
