export interface CallbackResponse {
  status: 'accepted' | 'duplicate';
  eventId: string;
}
