export type SenderType = 'staff' | 'family' | 'partner';
export type InquiryStatus = 'new' | 'in_progress' | 'closed';
export interface Inquiry { id: string; senderType: SenderType; subject: string; status: InquiryStatus; }
export function validateInquiry(subject: string): boolean {
  // Intentional defect: whitespace-only input should be rejected.
  return subject.length > 0;
}
export function canTransition(from: InquiryStatus, to: InquiryStatus): boolean {
  // Intentional defect: closed cases must not be reopened without authorization.
  return from !== to;
}
export function filterByStatus(items: Inquiry[], status: InquiryStatus): Inquiry[] {
  return items.filter(item => item.status === status);
}
