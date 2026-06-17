import * as React from 'react';
import { Profile } from '@/components/resume/types';
import { ContactsBlock, Photo, Rule, Section, TwoCol, Item, Bullets, Tags } from '@/components/resume/ui';

type Labels = Partial<Record<'summary' | 'experience' | 'skills' | 'education', string>>;

export default function ClassicATS({ data, labels = {} }: { data: Profile; labels?: Labels }) {
  return (
    <div className="h-full w-full p-8 [font-family:Inter,system-ui,sans-serif]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[20pt] font-extrabold leading-tight text-slate-900">{data.name}</div>
          <div className="text-[11pt] text-slate-600">{data.role}</div>
          <div className="mt-2"><ContactsBlock contacts={data.contacts} /></div>
        </div>
        <Photo src={data.photo} size="28mm" rounded="full" />
      </div>
      <Rule />
      <Section title={labels.summary || 'Summary'}>
        <p className="text-[10pt] leading-[1.4] text-slate-700">{data.summary}</p>
      </Section>
      <Rule />
      <Section title={labels.experience || 'Experience'}>
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} - ${exp.company}`} meta={`${exp.start} - ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} />
          </Item>
        ))}
      </Section>
      <Rule />
      <TwoCol>
        <Section title={labels.skills || 'Skills'}>
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
