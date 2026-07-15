// registerWebinar was Demio plumbing; Demio is retired. Delegate to the same
// capture-and-email flow as registerForEvent so any lingering callers keep working.
export { default } from './registerForEvent.js';
