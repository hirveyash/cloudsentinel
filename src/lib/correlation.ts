import { SecurityEvent } from './types/event';

export function findRelatedEvents(currentEvent: SecurityEvent, allEvents: SecurityEvent[]): SecurityEvent[] {
  return allEvents.filter((event) => {
    if (event.event_id === currentEvent.event_id) return false;
    if (currentEvent.source_ip && event.source_ip === currentEvent.source_ip) return true;
    if (currentEvent.actor && currentEvent.actor !== 'Unknown' && event.actor === currentEvent.actor) return true;
    return false;
  });
}