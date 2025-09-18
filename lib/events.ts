import { EventEmitter } from 'events';

// Global singleton to persist across hot reloads in dev
const globalAny = global as unknown as { _eventsBus?: EventEmitter };

export const events = globalAny._eventsBus || new EventEmitter();
events.setMaxListeners(100);

if (!globalAny._eventsBus) {
  globalAny._eventsBus = events;
}

export default events;
