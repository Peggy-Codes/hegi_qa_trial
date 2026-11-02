import { describe, expect, it } from 'vitest';
import { validateInquiry, canTransition, filterByStatus } from '../src/inquiry';
import type { Inquiry, InquiryStatus } from '../src/inquiry';
import inquiries from '../sample-data.json';
describe('inquiry baseline', () => {
  it('rejects empty subject', () => expect(validateInquiry('')).toBe(false));
  it('accepts subject', () => expect(validateInquiry('面談日程について')).toBe(true));
  it('filters new inquiries', () => expect(filterByStatus(inquiries as any, 'new')).toHaveLength(2));
});

describe('validateInquiry', () => {
  it.each([
    ['半角スペース', '   '],
    ['全角スペース', '　'],
    ['タブ・改行', '\t\n'],
  ])('T02/T07/T08: %s だけの件名は拒否する', (_label, subject) => {
    expect(validateInquiry(subject)).toBe(false);
  });

  it.each([
    ['trim 後1文字', 'a'],
    ['前後に空白', ' 相談 '],
  ])('T09/T10: %s の件名は受理する', (_label, subject) => {
    expect(validateInquiry(subject)).toBe(true);
  });
});

describe('canTransition', () => {
  it.each<[string, InquiryStatus]>([
    ['closed→new', 'new'],
    ['closed→in_progress', 'in_progress'],
  ])('T05/T11: %s の再開は拒否する', (_label, to) => {
    expect(canTransition('closed', to)).toBe(false);
  });

  it.each<[string, InquiryStatus]>([
    ['new→new', 'new'],
    ['in_progress→in_progress', 'in_progress'],
    ['closed→closed', 'closed'],
  ])('T13: %s の同値遷移は許可する', (_label, status) => {
    expect(canTransition(status, status)).toBe(true);
  });

  it.each<[string, InquiryStatus, InquiryStatus]>([
    ['new→in_progress', 'new', 'in_progress'],
    ['in_progress→closed', 'in_progress', 'closed'],
  ])('T04/T12: %s の正規の遷移は許可する', (_label, from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });
});

describe('filterByStatus', () => {
  it('T06: new の ID だけを返し、元の配列を変更しない', () => {
    const items = structuredClone(inquiries as Inquiry[]);
    const before = structuredClone(items);

    const result = filterByStatus(items, 'new');

    expect(result.map(item => item.id)).toEqual(['D001', 'D004']);
    expect(items).toEqual(before);
  });
});
