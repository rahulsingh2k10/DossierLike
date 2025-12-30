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

        // Header
        React.createElement(
          Section,
          { style: styles.header },
          React.createElement(
            Heading,
            { style: styles.headerText },
            'New Contact Form Submission'
          )
        ),

        // Content
        React.createElement(
          Section,
          { style: styles.content },
          React.createElement(Text, null, `Name: ${name}`),
          React.createElement(
            Text,
            null,
            'Email: ',
            React.createElement(Link, { href: `mailto:${email}` }, email)
          ),
          React.createElement(Text, null, `Subject: ${subject}`),

          React.createElement(
            Section,
            { style: styles.messageBox },
            React.createElement(Text, { style: styles.messageText }, message)
          ),

          React.createElement(
            Section,
            { style: styles.buttonWrapper },
            React.createElement(
              Button,
              { href: `mailto:${email}`, style: styles.button },
              'Reply to Message'
            )
          )
        ),

        // Footer
        React.createElement(
          Section,
          { style: styles.footer },
          React.createElement(Text, null, 'This email was sent from your portfolio website contact form.'),
          React.createElement(Text, null, `© ${year}`)
        )
      )
    )
  );
}

const styles = {
  body: {
    backgroundColor: '#f4f6f8',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: '24px',
    textAlign: 'center',
  },
  headerText: {
    color: '#ffffff',
    margin: 0,
    fontSize: '22px',
  },
  content: {
    padding: '24px',
    color: '#333333',
  },
  messageBox: {
    backgroundColor: '#f1f3f5',
    padding: '16px',
    borderLeft: '4px solid #4f46e5',
    marginTop: '16px',
  },
  messageText: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  },
  buttonWrapper: {
    textAlign: 'center',
    marginTop: '24px',
  },
  button: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#f1f3f5',
    padding: '16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#777777',
  },
};
