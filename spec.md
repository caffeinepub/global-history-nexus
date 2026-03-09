# Global History Nexus

## Current State

The backend stores historical events in a `Map.empty<Text, HistoricalEvent>()` which lives in heap memory. This means all events are lost whenever the canister restarts. The frontend re-seeds on every page load to work around this, but the seeding is a workaround rather than a fix.

## Requested Changes (Diff)

### Add
- `stable var eventsStable : [(Text, HistoricalEvent)]` to persist the event map across canister upgrades and restarts.
- `system func preupgrade` / `system func postupgrade` hooks to serialize/deserialize the map to/from the stable array.

### Modify
- Change `let historicalEvents` from `Map.empty` (heap) to a mutable variable initialized from stable storage on startup.
- The `addEvent` function should continue to work unchanged; data will now persist.

### Remove
- Nothing removed from the public API. The frontend seeding logic can remain as-is (it will skip already-existing events gracefully).

## Implementation Plan

1. Add `stable var eventsStable : [(Text, HistoricalEvent)] = []` at actor level.
2. Change `let historicalEvents` to `var historicalEvents` initialized from `Map.fromIter(eventsStable.vals())` on actor init.
3. Add `system func preupgrade() { eventsStable := historicalEvents.toArray() }`.
4. Add `system func postupgrade() { historicalEvents := Map.fromIter(eventsStable.vals()) }`.
5. Validate and deploy.
