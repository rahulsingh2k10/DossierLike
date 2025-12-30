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
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerText}>
              New Contact Form Submission
            </Heading>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading as="h2" style={styles.sectionTitle}>
              Contact Information
            </Heading>

            <Text><strong>Name:</strong> {name}</Text>
            <Text>
              <strong>Email:</strong>{' '}
              <Link href={`mailto:${email}`} style={styles.link}>
                {email}
              </Link>
            </Text>
            <Text><strong>Subject:</strong> {subject}</Text>

            <Heading as="h2" style={styles.sectionTitle}>
              Message
            </Heading>

            <Section style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </Section>

            <Section style={styles.buttonWrapper}>
              <Button href={`mailto:${email}`} style={styles.button}>
                Reply to Message
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text>
              This email was sent from your portfolio website contact form.
            </Text>
            <Text>© {year}</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f4f6f8',
    margin: 0,
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
  sectionTitle: {
    fontSize: '16px',
    marginTop: '20px',
    marginBottom: '10px',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
  },
  messageBox: {
    backgroundColor: '#f1f3f5',
    padding: '16px',
    borderLeft: '4px solid #4f46e5',
  },
  messageText: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    margin: 0,
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
