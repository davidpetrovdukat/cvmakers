import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

// ВАЖНО: Мы переименовали компонент, чтобы избежать конфликта с 'default' export.
// Теперь это именованный экспорт, как и ожидал наш API-роут.
export const ContactEmail: React.FC<Readonly<ContactEmailProps>> = ({
  name,
  email,
  message,
}) => (
  <Html>
    <Head />
    <Preview>New message from your cv-makers.co.uk contact form</Preview>
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
      <Container style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dfe1e6',
        borderRadius: '8px',
        margin: '40px auto',
        padding: '20px',
        maxWidth: '465px',
      }}>
        <Heading style={{ color: '#333', fontSize: '24px' }}>
          New Contact Form Submission
        </Heading>
        <Section>
          <Text style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
            You have received a new message from your website's contact form.
          </Text>
          <Text style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
            <strong>From:</strong> {name}
          </Text>
          <Text style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
            <strong>Email:</strong> {email}
          </Text>
        </Section>
        <Section style={{ borderTop: '1px solid #dfe1e6', marginTop: '20px', paddingTop: '20px' }}>
          <Heading as="h2" style={{ color: '#333', fontSize: '20px' }}>
            Message:
          </Heading>
          <Text style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {message}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Мы убрали 'export default', так как наш API роут использует именованный импорт.
