'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { initialUniverse, slugFromName, validateUniverse, type UniverseDraft } from '@/lib/universe-creation';
import { BasicInfoStep, CommunitySetupStep, SectionsStep, UniversePreviewStep, buttonClass } from './steps';

const labels = ['기본 정보', '커뮤니티 설정', '시작 섹션', '미리보기'];
export default function UniverseCreationWizard({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<UniverseDraft>(() => ({ ...initialUniverse, sections: [...initialUniverse.sections] }));
  const [step, setStep] = useState(0);
  const [slugEdited, setSlugEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  function update(patch: Partial<UniverseDraft>) { setDraft(d => ({ ...d, ...patch })); setError(''); }
  async function advance() {
    if (lock.current || success) return;
    const message = validateUniverse(draft, step);
    if (message) { setError(message); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      if (!demo && (step === 0 || step === 3)) {
        const check = await fetch(`/api/universes/availability?slug=${encodeURIComponent(draft.slug)}`, { cache: 'no-store' });
        const result = await check.json();
        if (!check.ok || !result.available) throw new Error(result.error || '이미 사용 중인 주소예요. 다른 주소를 입력해주세요.');
      }
      if (step < 3) { setStep(s => s + 1); return; }
      if (demo) { setSuccess(true); return; }
      const response = await fetch('/api/universes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '만들지 못했어요. 잠시 후 다시 시도해주세요.');
      setSuccess(true);
      router.push(`/universe/${result[0].slug}`);
      router.refresh();
    } catch (e) { setError(e instanceof Error && e.message !== 'Failed to fetch' ? e.message : '연결이 끊겼어요. 입력 내용은 유지돼요. 잠시 후 다시 시도해주세요.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#03050a] dark:text-white"><div className="mx-auto max-w-2xl"><Link href="/universe" className="text-sm font-bold text-slate-500">← 유니버스로 돌아가기</Link><h1 className="mt-6 text-3xl font-black">우리만의 유니버스 만들기</h1><p className="mt-3 text-slate-500">함께할 주제 하나면 충분해요. 나머지는 차근차근 정해봐요.</p>{demo && <p role="status" className="mt-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-950">개발 미리보기예요. 실제 계정이나 데이터에 저장되지 않아요.</p>}
    <ol aria-label="생성 진행 단계" className="my-8 grid grid-cols-4 gap-2">{labels.map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined} className={`border-t-4 pt-3 text-xs sm:text-sm ${i <= step ? 'border-violet-500 font-bold' : 'border-slate-200 text-slate-500'}`}><span className="block">{i + 1}</span>{label}</li>)}</ol>
    <form onSubmit={e => { e.preventDefault(); void advance(); }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8" noValidate>
      <h2 ref={heading} tabIndex={-1} className="mb-6 text-xl font-bold outline-none">{labels[step]}</h2>
      <fieldset disabled={busy || success} className="min-w-0">
        {step === 0 && <BasicInfoStep draft={draft} update={update} changeName={name => update({ name, ...(!slugEdited ? { slug: slugFromName(name) } : {}) })} changeSlug={slug => { setSlugEdited(true); update({ slug }); }} />}
        {step === 1 && <CommunitySetupStep draft={draft} update={update} />}
        {step === 2 && <SectionsStep draft={draft} update={update} />}
        {step === 3 && <UniversePreviewStep draft={draft} />}
      </fieldset>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      {success && <p role="status" className="mt-5 text-sm text-green-700 dark:text-green-300">{demo ? '미리보기 완료! 실제 생성 흐름을 끝까지 확인했어요.' : '유니버스를 만들었어요! 이동 중이에요.'}</p>}
      <div className="mt-8 flex items-center justify-between gap-3"><button type="button" className={buttonClass} disabled={step === 0 || busy || success} onClick={() => { setStep(s => s - 1); setError(''); }}>이전</button><button type="submit" disabled={busy || success} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">{busy && <Loader2 size={16} className="animate-spin" />}{busy ? (step === 3 ? '만드는 중…' : '주소 확인 중…') : step === 3 ? (demo ? '미리보기 완료' : '유니버스 만들기') : '다음'}</button></div>
    </form></div></main>;
}
