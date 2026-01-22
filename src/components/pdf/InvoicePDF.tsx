import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    padding: 12,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
  },
  columnTitle: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e293b',
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
    color: '#475569',
    lineHeight: 1.4,
  },
  contentBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
  },
  contentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#475569',
  },
  contentText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: '40%',
    fontSize: 10,
    color: '#64748b',
  },
  detailValue: {
    width: '60%',
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  summaryBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    border: '1px solid #d1fae5',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#059669',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #d1fae5',
  },
  totalLabel: {
    width: '40%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  totalValue: {
    width: '60%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  notes: {
    marginTop: 20,
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
  bankDetails: {
    marginTop: 10,
    paddingTop: 8,
  },
  bankTitle: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
});

interface InvoicePDFProps {
  invoiceNumber: string;
  invoiceDate: string;
  orderMerchantId: string;
  description: string;
  sender: {
    company?: string;
    vat?: string;
    address?: string;
    city?: string;
    country?: string;
    iban?: string;
    bankName?: string;
    bic?: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  payment: {
    tokens: number;
    subtotal: number;
    vat: number;
    total: number;
    currency: string;
    newBalance: number;
  };
  notes?: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoiceNumber,
  invoiceDate,
  orderMerchantId,
  description,
  sender,
  recipient,
  payment,
  notes,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Invoice {invoiceNumber}</Text>
        <Text style={styles.subtitle}>CV Makers</Text>
      </View>

      {/* Sender and Recipient */}
      <View style={styles.row}>
        <View style={[styles.column, { marginRight: 10 }]}>
          <Text style={styles.columnTitle}>From</Text>
          <Text style={styles.companyName}>{sender.company || 'CV Makers'}</Text>
          {sender.address && <Text style={styles.text}>{sender.address}</Text>}
          {(sender.city || sender.country) && (
            <Text style={styles.text}>
              {[sender.city, sender.country].filter(Boolean).join(', ')}
            </Text>
          )}
          {sender.vat && <Text style={styles.text}>VAT: {sender.vat}</Text>}
          
          {(sender.iban || sender.bankName || sender.bic) && (
            <View style={styles.bankDetails}>
              <Text style={styles.bankTitle}>Bank Details</Text>
              {sender.bankName && <Text style={styles.text}>Bank: {sender.bankName}</Text>}
              {sender.iban && <Text style={styles.text}>IBAN: {sender.iban}</Text>}
              {sender.bic && <Text style={styles.text}>BIC: {sender.bic}</Text>}
            </View>
          )}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>To</Text>
          <Text style={styles.companyName}>{recipient.name}</Text>
          <Text style={styles.text}>{recipient.email}</Text>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>Order Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID:</Text>
          <Text style={styles.detailValue}>{orderMerchantId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Invoice Number:</Text>
          <Text style={styles.detailValue}>{invoiceNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{invoiceDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{description}</Text>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tokens credited:</Text>
          <Text style={styles.detailValue}>{payment.tokens.toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Subtotal:</Text>
          <Text style={styles.detailValue}>
            {payment.currency} {payment.subtotal.toFixed(2)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>VAT:</Text>
          <Text style={styles.detailValue}>
            {payment.currency} {payment.vat.toFixed(2)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total paid:</Text>
          <Text style={styles.totalValue}>
            {payment.currency} {payment.total.toFixed(2)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>New balance:</Text>
          <Text style={[styles.detailValue, { color: '#059669' }]}>
            {payment.newBalance.toLocaleString()} tokens
          </Text>
        </View>
      </View>

      {/* Notes */}
      {notes && <Text style={styles.notes}>{notes}</Text>}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your purchase!</Text>
        <Text style={{ marginTop: 5 }}>
          If you have any questions, please contact us at info@cv-makers.co.uk
        </Text>
        <Text style={{ marginTop: 5 }}>CV Makers - Professional CV & Resume Creator</Text>
        <Text>https://cv-makers.co.uk</Text>
      </View>
    </Page>
  </Document>
);
