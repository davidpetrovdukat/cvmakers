import * as React from 'react';
import { Profile } from '@/components/resume/types';
import { ContactsBlock, Photo, Section, Item, Bullets, Tags } from '@/components/resume/ui';

type Labels = Partial<Record<'summary' | 'experience' | 'skills' | 'education', string>>;

export default function ModernSplit({ data, labels = {} }: { data: Profile; labels?: Labels }) {
  return (
    <div className="h-full w-full p-0 [font-family:Inter,system-ui,sans-serif]">
      <div className="grid h-full grid-cols-[28%_1fr]">
        <aside className="space-y-6 bg-slate-50 p-7">
          <div className="flex flex-col items-center gap-3">
            <Photo src={data.photo} size="32mm" rounded="full" />
            <div className="text-center">
              <div className="text-[16pt] font-bold leading-tight text-slate-900">{data.name}</div>
              <div className="text-[10pt] text-slate-600">{data.role}</div>
            </div>
          </div>
          <ContactsBlock contacts={data.contacts} compact />
          <Section title={labels.skills || 'Skills'}>
            <Tags items={data.skills} />
          </Section>
          <Section title={labels.education || 'Education'}>
            {data.education.map((ed) => (
              <Item key={ed.id} title={ed.school} meta={`${ed.degree} • ${ed.year}`} />
            ))}
          </Section>
        </aside>
        <main className="space-y-5 p-7">
          <Section title={labels.summary || 'Summary'}>
            <p className="text-[10pt] leading-[1.4] text-slate-700">{data.summary}</p>
          </Section>
          <Section title={labels.experience || 'Experience'}>
            {data.experience.map((exp) => (
              <Item key={exp.id} title={`${exp.title} - ${exp.company}`} meta={`${exp.start} - ${exp.end} • ${exp.location}`}>
                <Bullets items={exp.points} />
              </Item>
            ))}
          </Section>
        </main>
      </div>
    </div>
  );
}
