import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Стили для PDF документа
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  logo: {
    width: 50,
    height: 50,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
    color: '#64748b',
  },
  metaLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  partyBox: {
    flex: 1,
    padding: 12,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  partyTitle: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e293b',
  },
  partyText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#475569',
    lineHeight: 1.4,
  },
  bankDetails: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px solid #f1f5f9',
  },
  bankTitle: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  contentBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  contentHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#475569',
  },
  contentText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  notes: {
    marginTop: 15,
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1px solid #e2e8f0',
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

interface Party {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  vat?: string;
  address?: string;
  city?: string;
  country?: string;
  iban?: string;
  bankName?: string;
  bic?: string;
  logoUrl?: string;
}

interface ContentBlock {
  heading?: string;
  text?: string;
}

interface DocumentPDFProps {
  title: string;
  documentNo?: string;
  documentDate?: string;
  sender?: Party;
  recipient?: Party;
  content?: ContentBlock[];
  notes?: string;
  footerText?: string;
}

export const DocumentPDF: React.FC<DocumentPDFProps> = ({
  title,
  documentNo,
  documentDate,
  sender,
  recipient,
  content,
  notes,
  footerText,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title || 'Document'}</Text>
          {(documentNo || documentDate) && (
            <View>
              {documentNo && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>No:</Text>
                  <Text>{documentNo}</Text>
                </View>
              )}
              {documentDate && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Date:</Text>
                  <Text>{documentDate}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        {sender?.logoUrl && (
          <Image src={sender.logoUrl} style={styles.logo} />
        )}
      </View>

      {/* Sender and Recipient */}
      <View style={styles.row}>
        {/* From */}
        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>From</Text>
          <Text style={styles.partyName}>
            {sender?.company || sender?.name || '—'}
          </Text>
          {sender?.address && <Text style={styles.partyText}>{sender.address}</Text>}
          {(sender?.city || sender?.country) && (
            <Text style={styles.partyText}>
              {[sender.city, sender.country].filter(Boolean).join(', ')}
            </Text>
          )}
          {sender?.email && <Text style={styles.partyText}>{sender.email}</Text>}
          {sender?.phone && <Text style={styles.partyText}>{sender.phone}</Text>}
          {sender?.vat && <Text style={styles.partyText}>VAT: {sender.vat}</Text>}
          
          {(sender?.iban || sender?.bankName || sender?.bic) && (
            <View style={styles.bankDetails}>
              <Text style={styles.bankTitle}>Bank Details</Text>
              {sender?.bankName && <Text style={styles.partyText}>Bank: {sender.bankName}</Text>}
              {sender?.iban && <Text style={styles.partyText}>IBAN: {sender.iban}</Text>}
              {sender?.bic && <Text style={styles.partyText}>BIC: {sender.bic}</Text>}
            </View>
          )}
        </View>

        {/* To */}
        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>To</Text>
          <Text style={styles.partyName}>
            {recipient?.company || recipient?.name || '—'}
          </Text>
          {recipient?.address && <Text style={styles.partyText}>{recipient.address}</Text>}
          {(recipient?.city || recipient?.country) && (
            <Text style={styles.partyText}>
              {[recipient.city, recipient.country].filter(Boolean).join(', ')}
            </Text>
          )}
          {recipient?.email && <Text style={styles.partyText}>{recipient.email}</Text>}
        </View>
      </View>

      {/* Content */}
      {content && content.length > 0 && content.map((block, idx) => (
        <View key={idx} style={styles.contentBox}>
          {block.heading && (
            <Text style={styles.contentHeading}>{block.heading}</Text>
          )}
          {block.text && (
            <Text style={styles.contentText}>{block.text}</Text>
          )}
        </View>
      ))}

      {/* Notes */}
      {notes && <Text style={styles.notes}>{notes}</Text>}

      {/* Footer */}
      {footerText && (
        <View style={styles.footer}>
          <Text>{footerText}</Text>
        </View>
      )}
    </Page>
  </Document>
);
