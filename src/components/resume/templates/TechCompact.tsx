import * as React from 'react';
import { Profile } from '@/components/resume/types';
import { ContactsBlock, Photo, Section, TwoCol, Item, Bullets, Tags } from '@/components/resume/ui';

type Labels = Partial<Record<'summary' | 'experience' | 'skills' | 'education', string>>;

export default function TechCompact({ data, labels = {} }: { data: Profile; labels?: Labels }) {
  return (
    <div className="h-full w-full p-7 [font-family:Inter,system-ui,sans-serif]">
      <div className="mb-3 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[18pt] font-bold uppercase tracking-wide text-slate-900">{data.name}</div>
          <div className="text-[10pt] text-slate-600">{data.role}</div>
          <div className="mt-1"><ContactsBlock contacts={data.contacts} compact /></div>
        </div>
        <Photo src={data.photo} size="26mm" rounded="full" />
      </div>
      <Section title={labels.summary || 'Summary'}>
        <p className="text-[9.5pt] leading-[1.45] text-slate-700">{data.summary}</p>
      </Section>
      <Section title={labels.experience || 'Experience'}>
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} @ ${exp.company}`} meta={`${exp.start} - ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} tight />
          </Item>
        ))}
      </Section>
      <TwoCol>
        <Section title={labels.skills || 'Skills'}>
          <Tags items={data.skills} compact />
        </Section>
        <Section title={labels.education || 'Education'}>
          {data.education.map((ed) => (
            <Item key={ed.id} title={`${ed.degree}`} meta={`${ed.school} • ${ed.year}`} />
          ))}
        </Section>
      </TwoCol>
    </div>
  );
}
