import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Profile } from '@/components/resume/types';

// РЎС‚РёР»Рё РґР»СЏ PDF СЂРµР·СЋРјРµ
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
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e293b',
  },
  role: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  contacts: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 20,
  },
  section: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
  },
  experienceItem: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  bulletList: {
    marginTop: 4,
    marginLeft: 12,
  },
  bullet: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  twoColumn: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  columnLast: {
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    fontSize: 9,
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
    marginBottom: 6,
  },
  educationItem: {
    marginBottom: 8,
  },
});

interface ResumePDFProps {
  data: Profile;
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';
};

// Helper to validate photo URL for @react-pdf/renderer
const isValidPhotoUrl = (url: string | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  // @react-pdf/renderer Image works with http/https URLs
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && url.length > 0;
  } catch {
    return false;
  }
};

export const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => {
  const hasValidPhoto = isValidPhotoUrl(data.photo);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with name, role, contacts, and photo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{toText(data.name) || 'No Name'}</Text>
            {data.role && <Text style={styles.role}>{toText(data.role)}</Text>}
            <View style={styles.contacts}>
              {data.contacts.email && <Text>{toText(data.contacts.email)}</Text>}
              {data.contacts.phone && <Text>{toText(data.contacts.phone)}</Text>}
              {data.contacts.location && <Text>{toText(data.contacts.location)}</Text>}
              {data.contacts.website && <Text>{toText(data.contacts.website)}</Text>}
              {data.contacts.linkedin && <Text>{toText(data.contacts.linkedin)}</Text>}
            </View>
          </View>
          {hasValidPhoto && (
            <Image src={data.photo!} style={styles.photo} />
          )}
        </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{toText(data.summary)}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <Text style={styles.itemTitle}>
                {toText(exp.title)} - {toText(exp.company)}
              </Text>
              <Text style={styles.itemMeta}>
                {toText(exp.start)} - {toText(exp.end)} вЂў {toText(exp.location)}
              </Text>
              {exp.points && exp.points.length > 0 && (
                <View style={styles.bulletList}>
                  {exp.points.map((point, idx) => (
                    <Text key={idx} style={styles.bullet}>
                      вЂў {toText(point)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills and Education (Two Columns) */}
      <View style={styles.twoColumn}>
        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {data.skills.map((skill, idx) => (
                <Text key={idx} style={styles.skillTag}>
                  {toText(skill)}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.columnLast}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((ed) => (
              <View key={ed.id} style={styles.educationItem}>
                <Text style={styles.itemTitle}>
                  {toText(ed.degree)}, {toText(ed.school)}
                </Text>
                <Text style={styles.itemMeta}>
                  {toText(ed.year)} вЂў {toText(ed.location)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
  );
};



