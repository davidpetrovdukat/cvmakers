import * as React from 'react';
import { Profile } from '@/components/resume/types';
import { ContactsBlock, Photo, Rule, Section, TwoCol, Item, Bullets, Tags } from '@/components/resume/ui';

type Labels = Partial<Record<'profile' | 'experience' | 'skills' | 'education', string>>;

export default function ElegantSerif({ data, labels = {} }: { data: Profile; labels?: Labels }) {
  return (
    <div className="h-full w-full p-8 font-serif">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[20pt] font-extrabold tracking-tight text-slate-900">{data.name}</div>
          <div className="text-[11pt] text-slate-600">{data.role}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Photo src={data.photo} size="30mm" rounded="lg" />
          <ContactsBlock contacts={data.contacts} />
        </div>
      </div>
      <Rule />
      <Section title={labels.profile || 'Profile'}>
        <p className="text-[10pt] leading-[1.5] text-slate-700">{data.summary}</p>
      </Section>
      <Rule />
      <Section title={labels.experience || 'Professional Experience'}>
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} - ${exp.company}`} meta={`${exp.start} - ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} />
          </Item>
        ))}
      </Section>
      <Rule />
      <TwoCol gap="10mm">
        <Section title={labels.skills || 'Core Skills'}>
          <Tags items={data.skills} />
        </Section>
        <Section title={labels.education || 'Education'}>
          {data.education.map((ed) => (
            <Item key={ed.id} title={`${ed.degree}, ${ed.school}`} meta={`${ed.year} • ${ed.location}`} />
          ))}
        </Section>
      </TwoCol>
    </div>
  );
}
