'use client';

import { motion } from 'framer-motion';
import { PolicySection } from '@/types/policy';
import Card from '@/components/ui/Card';

interface PolicyContentProps {
  sections: PolicySection[];
}

export default function PolicyContent({ sections }: PolicyContentProps) {
  return (
    <Card className="p-6" padding="md">
      {sections.map((s, index) => (
        <motion.section 
          key={s.id} 
          id={s.id} 
          className="scroll-mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <h2 className="text-xl font-semibold mt-6 first:mt-0">{s.title}</h2>
          {s.body && (
            <div className="mt-2 space-y-3 text-slate-700 text-sm">
              {s.body.split('\n\n').map((block, idx) => {
                const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
                const isList = lines.length > 1 && lines.every((l) => l.startsWith('•'));
                if (isList) {
                  return (
                    <ul key={idx} className="list-disc pl-5">
                      {lines.map((l, i) => (
                        <li key={i}>{l.replace(/^•\s?/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                // Handle single line breaks within paragraphs
                if (lines.length > 1) {
                  return (
                    <div key={idx}>
                      {lines.map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                    </div>
                  );
                }
                return <p key={idx}>{block}</p>;
              })}
            </div>
          )}
        </motion.section>
      ))}
    </Card>
  );
}
