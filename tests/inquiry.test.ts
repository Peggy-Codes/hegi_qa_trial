import { describe, expect, it } from 'vitest';
import { validateInquiry, filterByStatus } from '../src/inquiry';
import inquiries from '../sample-data.json';
describe('inquiry baseline', () => {
  it('rejects empty subject', () => expect(validateInquiry('')).toBe(false));
  it('accepts subject', () => expect(validateInquiry('面談日程について')).toBe(true));
  it('filters new inquiries', () => expect(filterByStatus(inquiries as any, 'new')).toHaveLength(2));
});
