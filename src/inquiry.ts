export type SenderType = 'staff' | 'family' | 'partner';
export type InquiryStatus = 'new' | 'in_progress' | 'closed';
export interface Inquiry { id: string; senderType: SenderType; subject: string; status: InquiryStatus; }
export function validateInquiry(subject: string): boolean {
  return subject.trim().length > 0;
}
export function canTransition(from: InquiryStatus, to: InquiryStatus): boolean {
  if (from === to) return true;
  return from !== 'closed';
}
export function filterByStatus(items: Inquiry[], status: InquiryStatus): Inquiry[] {
  return items.filter(item => item.status === status);
}
