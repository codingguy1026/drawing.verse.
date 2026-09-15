import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { universeCategories, type UniverseDraft } from '@/lib/universe-creation';

export const inputClass = 'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/15 dark:bg-slate-900 dark:text-white';
export const buttonClass = 'rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/10';
type Props = { draft: UniverseDraft; update: (patch: Partial<UniverseDraft>) => void };
function Field({ title, children }: { title: string; children: ReactNode }) { return <label className="block text-sm font-semibold">{title}{children}</label>; }
export function BasicInfoStep({ draft, update, changeName, changeSlug }: Props & { changeName: (name: string) => void; changeSlug: (slug: string) => void }) {
  return <div className="space-y-5">
    <Field title="유니버스 이름 *"><input className={inputClass} value={draft.name} onChange={e => changeName(e.target.value)} maxLength={60} autoFocus placeholder="함께 이야기할 공간의 이름" /></Field>
    <Field title="짧은 소개"><textarea className={inputClass} value={draft.description} onChange={e => update({ description: e.target.value })} maxLength={280} rows={3} /></Field>
    <Field title="주소 (슬러그) *"><input className={inputClass} value={draft.slug} onChange={e => changeSlug(e.target.value)} maxLength={64} autoCapitalize="none" spellCheck={false} aria-describedby="slug-help" placeholder="my-universe" /></Field>
    <p id="slug-help" className="text-sm text-slate-500">영문 소문자·숫자·하이픈을 사용해요. 한글 이름이라면 영문 주소를 직접 적어주세요.<br /><span className="break-all">/universe/{draft.slug || 'my-universe'}</span></p>
    <div className="grid gap-5 sm:grid-cols-2"><Field title="카테고리"><select className={inputClass} value={draft.category} onChange={e => update({ category: e.target.value })}>{Object.entries(universeCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
    <Field title="아이콘 / 이모지 (선택)"><input className={inputClass} value={draft.icon} onChange={e => update({ icon: e.target.value })} maxLength={16} /></Field></div>
    <div className="flex items-center gap-4 rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><span className="text-3xl">{draft.icon || '🌌'}</span><strong className="break-all">{draft.name || '새로운 유니버스'}</strong></div>
  </div>;
}
export function CommunitySetupStep({ draft, update }: Props) {
  return <div className="space-y-6"><fieldset><legend className="mb-3 font-bold">누구에게 공개할까요?</legend><div className="grid gap-3 sm:grid-cols-2">{(['public', 'private'] as const).map(v => <label key={v} className={buttonClass}><input type="radio" name="visibility" checked={draft.visibility === v} onChange={() => update({ visibility: v })} className="mr-2" />{v === 'public' ? '공개' : '비공개'}</label>)}</div><p className="mt-3 text-sm text-slate-500">비공개 유니버스는 현재 소유자만 볼 수 있어요. 초대 기능은 아직 제공하지 않아요.</p></fieldset>
    <label className="flex items-center gap-3"><input type="checkbox" checked={draft.allow_member_posts} onChange={e => update({ allow_member_posts: e.target.checked })} />멤버의 게시글 작성 허용</label>
    <p className="text-sm text-slate-500">공개 유니버스는 로그인한 누구나 참여할 수 있어요. 작성 허용을 끄면 소유자만 글을 쓸 수 있어요.</p>
    <label className="flex items-center gap-3"><input type="checkbox" checked={draft.allow_comments} onChange={e => update({ allow_comments: e.target.checked })} />댓글 허용</label>
    <Field title="커뮤니티 규칙 (선택)"><textarea className={inputClass} rows={5} maxLength={2000} value={draft.rules} onChange={e => update({ rules: e.target.value })} placeholder="서로 존중하며 이야기해주세요." /></Field>
  </div>;
}
export function SectionsStep({ draft, update }: Props) {
  function move(index: number, offset: number) { const sections = [...draft.sections]; [sections[index], sections[index + offset]] = [sections[index + offset], sections[index]]; update({ sections }); }
  return <div className="space-y-4"><p className="text-sm text-slate-500">게시글을 나눌 섹션을 1~8개 정해보세요. 화살표로 순서를 바꿀 수 있어요.</p>
    {draft.sections.map((section, index) => <div key={index} className="flex flex-wrap items-center gap-2"><input className={`${inputClass} !mt-0 min-w-0 flex-1`} aria-label={`섹션 ${index + 1} 이름`} value={section} maxLength={30} onChange={e => update({ sections: draft.sections.map((s, i) => i === index ? e.target.value : s) })} /><button type="button" className={buttonClass} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`섹션 ${index + 1} 위로`}><ArrowUp size={16} /></button><button type="button" className={buttonClass} disabled={index === draft.sections.length - 1} onClick={() => move(index, 1)} aria-label={`섹션 ${index + 1} 아래로`}><ArrowDown size={16} /></button><button type="button" className={buttonClass} disabled={draft.sections.length === 1} onClick={() => update({ sections: draft.sections.filter((_, i) => i !== index) })} aria-label={`섹션 ${index + 1} 삭제`}><Trash2 size={16} /></button></div>)}
    <button type="button" className={`${buttonClass} flex items-center gap-2`} disabled={draft.sections.length >= 8} onClick={() => update({ sections: [...draft.sections, ''] })}><Plus size={16} />섹션 추가</button></div>;
}
export function UniversePreviewStep({ draft }: { draft: UniverseDraft }) {
  return <article className="space-y-5 break-words rounded-3xl border border-slate-200 p-6 dark:border-white/10"><div className="text-5xl">{draft.icon || '🌌'}</div><h2 className="text-3xl font-black">{draft.name}</h2><p className="whitespace-pre-wrap text-slate-500">{draft.description || '이곳에서 새로운 이야기가 시작돼요.'}</p><p className="text-sm">{draft.visibility === 'public' ? '공개' : '비공개 · 소유자만 접근'} · {universeCategories[draft.category as keyof typeof universeCategories]}</p><p className="text-sm">{draft.allow_member_posts ? '멤버 글쓰기 허용' : '소유자만 글쓰기'} · {draft.allow_comments ? '댓글 허용' : '댓글 사용 안 함'}</p><ul className="flex flex-wrap gap-2">{draft.sections.map((s, i) => <li className="rounded-xl bg-violet-50 px-3 py-2 text-sm dark:bg-violet-500/10" key={i}>{s}</li>)}</ul>{draft.rules && <p className="whitespace-pre-wrap text-sm">{draft.rules}</p>}<p className="break-all rounded-xl bg-slate-100 p-3 text-sm dark:bg-white/5">/universe/{draft.slug}</p></article>;
}
