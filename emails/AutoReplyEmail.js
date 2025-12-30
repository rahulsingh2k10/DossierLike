const React = require('react');
const {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} = require('@react-email/components');

export default function AutoReplyEmail({ recipientName = 'there' }) {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(
      Body,
      { style: styles.main },
      React.createElement(
        Container,
        { style: styles.container },

        /* Header */
        React.createElement(
          Section,
          { style: styles.header },
          React.createElement(
            Heading,
            { style: styles.headerText },
            'Thank you for getting in touch'
          )
        ),

        /* Content */
        React.createElement(
          Section,
          { style: styles.content },

          React.createElement(Text, { style: styles.paragraph }, `Hi ${recipientName},`),

          React.createElement(
            Text,
            { style: styles.paragraph },
            'Thank you for reaching out through my portfolio website. I’ve received your message and appreciate you taking the time to connect.'
          ),

          React.createElement(
            Text,
            { style: styles.paragraph },
            'I personally review all messages and will respond as soon as possible.'
          ),

          React.createElement(
            Section,
            { style: styles.infoBox },
            React.createElement(Text, { style: styles.infoTitle }, 'What happens next?'),
            React.createElement(
              'ul',
              { style: styles.list },
              React.createElement('li', { style: styles.listItem }, 'Your message will be reviewed carefully'),
              React.createElement('li', { style: styles.listItem }, 'You can expect a response within 24–48 hours'),
			  React.createElement(
			  'li',
			  { style: styles.listItem },
			  'For professional networking, feel free to connect with me on ',
			  React.createElement(
				'a',
				{
				  href: 'https://www.linkedin.com/in/rahulsingh05/',
				  target: '_blank',
				  rel: 'noopener noreferrer',
				  style: {
					color: '#0a66c2',
					textDecoration: 'none',
					fontWeight: 'bold',
				  },
				},
				'LinkedIn'
			  ),
			  '.'
			)
            )
          ),

          React.createElement(
            Text,
            { style: styles.signature },
            React.createElement('span', null, 'Best regards,'),
            React.createElement('br'),
            React.createElement('strong', null, 'Rahul Singh')
          )
        ),

        React.createElement(Hr, { style: styles.divider }),

        /* Footer */
        React.createElement(
          Section,
          null,
          React.createElement(
            Text,
            { style: styles.footer },
            'This is an automated acknowledgment confirming receipt of your message.'
          )
        )
      )
    )
  );
}

module.exports = AutoReplyEmail;

/* ---------------- Styles ---------------- */

const styles = {
  main: {
    backgroundColor: '#f4f6f8',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '40px auto',
    maxWidth: '600px',
    padding: '0',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: '20px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  headerText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'normal',
    margin: '0',
  },
  content: {
    padding: '24px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333333',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '16px',
    margin: '20px 0',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  list: {
    paddingLeft: '20px',
    margin: '0',
  },
  listItem: {
    fontSize: '13px',
    marginBottom: '6px',
  },
  signature: {
    fontSize: '14px',
    marginTop: '20px',
  },
  divider: {
    borderColor: '#eaeaea',
  },
  footer: {
    fontSize: '12px',
    color: '#777777',
    textAlign: 'center',
    padding: '12px 24px 20px',
  },
};
