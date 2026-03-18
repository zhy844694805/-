# WeChat Mini Program Todo MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program MVP for dual-user todo planning with a month-view home page, shared/private lists, invite-based pairing, and offline-first task editing plus replay sync.

**Architecture:** Start from a native WeChat Mini Program with TypeScript, organize product logic around focused service and store modules, and keep all permission-sensitive writes behind cloud functions. Use a lightweight local cache plus an ordered sync queue so the month view and day-detail workflow remain usable offline without building a complex sync engine.

**Tech Stack:** Native WeChat Mini Program, TypeScript, WeChat Cloud Development, MobX MiniProgram, Jest, ts-jest, wx-server-sdk, dayjs

---

## Preconditions

- Run this plan from `/Users/tuohai/Desktop/任务清单`.
- Approved spec: `docs/superpowers/specs/2026-03-18-wechat-miniprogram-todo-design.md`.
- Have Node.js LTS, npm, and WeChat DevTools installed locally.
- Enable cloud development in WeChat DevTools before wiring runtime cloud calls.
- If you want an isolated workspace first, use `@superpowers/using-git-worktrees` before implementing.

## Planned File Structure

### Root and tooling

- `package.json` - npm scripts and dependencies
- `package-lock.json` - lockfile
- `tsconfig.json` - TypeScript compiler configuration
- `jest.config.cjs` - Jest and `ts-jest` setup
- `project.config.json` - WeChat Mini Program project config
- `.gitignore` - ignore local build output and DevTools artifacts

### App shell

- `miniprogram/app.ts` - cloud initialization and app bootstrap
- `miniprogram/app.json` - page registration and window defaults
- `miniprogram/app.wxss` - shared app-level styles
- `miniprogram/sitemap.json` - sitemap config

### Pages

- `miniprogram/pages/home/index.ts` - month-view page controller
- `miniprogram/pages/home/index.wxml` - home page structure
- `miniprogram/pages/home/index.wxss` - home page styles
- `miniprogram/pages/home/index.json` - page component config
- `miniprogram/pages/task-editor/index.ts` - create/edit task page logic
- `miniprogram/pages/task-editor/index.wxml` - task editor layout
- `miniprogram/pages/task-editor/index.wxss` - task editor styles
- `miniprogram/pages/task-editor/index.json` - task editor config
- `miniprogram/pages/list-manager/index.ts` - lightweight list management page logic
- `miniprogram/pages/list-manager/index.wxml` - list manager layout
- `miniprogram/pages/list-manager/index.wxss` - list manager styles
- `miniprogram/pages/list-manager/index.json` - list manager config
- `miniprogram/pages/invite/index.ts` - invite-accept page logic
- `miniprogram/pages/invite/index.wxml` - invite page layout
- `miniprogram/pages/invite/index.wxss` - invite page styles
- `miniprogram/pages/invite/index.json` - invite page config

### Components

- `miniprogram/components/month-header/index.ts` - month switch and scope filter events
- `miniprogram/components/month-header/index.wxml` - month header markup
- `miniprogram/components/month-header/index.wxss` - month header styles
- `miniprogram/components/month-header/index.json` - component config
- `miniprogram/components/month-grid/index.ts` - month grid rendering logic
- `miniprogram/components/month-grid/index.wxml` - month grid markup
- `miniprogram/components/month-grid/index.wxss` - month grid styles
- `miniprogram/components/month-grid/index.json` - component config
- `miniprogram/components/day-task-list/index.ts` - day-detail list events
- `miniprogram/components/day-task-list/index.wxml` - day-detail list markup
- `miniprogram/components/day-task-list/index.wxss` - day-detail list styles
- `miniprogram/components/day-task-list/index.json` - component config
- `miniprogram/components/task-item/index.ts` - task row interaction handlers
- `miniprogram/components/task-item/index.wxml` - task row markup
- `miniprogram/components/task-item/index.wxss` - task row styles
- `miniprogram/components/task-item/index.json` - component config

### Stores, models, services, utils

- `miniprogram/models/user.ts` - user type definitions
- `miniprogram/models/space.ts` - space and invite types
- `miniprogram/models/list.ts` - list types
- `miniprogram/models/task.ts` - task types
- `miniprogram/stores/app-store.ts` - user and space bootstrap state
- `miniprogram/stores/home-store.ts` - selected date, month window, summaries, and filters
- `miniprogram/services/cloud.ts` - `wx.cloud` bootstrap wrapper
- `miniprogram/services/user-service.ts` - current-user bootstrap and profile reads
- `miniprogram/services/space-service.ts` - invite creation and acceptance client calls
- `miniprogram/services/list-service.ts` - list reads and list-management writes
- `miniprogram/services/task-service.ts` - month queries and task writes
- `miniprogram/services/sync-service.ts` - pending-operation replay orchestration
- `miniprogram/services/network-service.ts` - online/offline detection wrapper
- `miniprogram/utils/date/local-date.ts` - immutable local-date helpers
- `miniprogram/utils/date/due-date-key.ts` - `YYYY-MM-DD` conversion helpers
- `miniprogram/utils/date/month-window.ts` - fixed 6-row month grid helpers
- `miniprogram/utils/permissions.ts` - list/task visibility and write rules
- `miniprogram/utils/storage.ts` - namespaced local-storage access
- `miniprogram/utils/sync-queue.ts` - queued offline operations

### Cloud functions

- `cloudfunctions/_shared/db.js` - shared cloud database initialization
- `cloudfunctions/_shared/guards.js` - membership and invite checks
- `cloudfunctions/createSpaceInvite/index.js` - create pending space and invite
- `cloudfunctions/createSpaceInvite/package.json` - function runtime deps
- `cloudfunctions/acceptSpaceInvite/index.js` - bind second user to pending space
- `cloudfunctions/acceptSpaceInvite/package.json` - function runtime deps
- `cloudfunctions/upsertTask/index.js` - create or update task with permission checks
- `cloudfunctions/upsertTask/package.json` - function runtime deps
- `cloudfunctions/toggleTaskCompletion/index.js` - task completion mutation
- `cloudfunctions/toggleTaskCompletion/package.json` - function runtime deps
- `cloudfunctions/manageList/index.js` - create or rename list with visibility checks
- `cloudfunctions/manageList/package.json` - function runtime deps

### Tests

- `tests/utils/local-date.test.ts`
- `tests/utils/due-date-key.test.ts`
- `tests/utils/month-window.test.ts`
- `tests/utils/permissions.test.ts`
- `tests/utils/sync-queue.test.ts`
- `tests/utils/task-editor-options.test.ts`
- `tests/services/user-service.test.ts`
- `tests/services/space-service.test.ts`
- `tests/services/task-service.test.ts`
- `tests/stores/home-store.test.ts`
- `tests/integration/invite-flow.test.ts`
- `tests/integration/offline-sync.test.ts`

### Task 1: Bootstrap Native Mini Program Workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `jest.config.cjs`
- Create: `project.config.json`
- Create: `miniprogram/app.ts`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`
- Create: `miniprogram/pages/home/index.ts`
- Create: `miniprogram/pages/home/index.wxml`
- Create: `miniprogram/pages/home/index.wxss`
- Create: `miniprogram/pages/home/index.json`
- Modify: `.gitignore`

**Sub-skill:** `@superpowers/test-driven-development` does not apply to pure scaffolding; begin strict TDD in Task 2.

- [ ] **Step 1: Initialize npm and add runtime dependencies**

Run:

```bash
npm init -y
npm install dayjs mobx-miniprogram mobx-miniprogram-bindings
```

Expected: `package.json` exists and runtime deps are recorded.

- [ ] **Step 2: Add dev tooling dependencies**

Run:

```bash
npm install -D typescript jest ts-jest @types/jest miniprogram-api-typings
```

Expected: dev dependencies are added for TypeScript and tests.

- [ ] **Step 3: Add package scripts and tool configs**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "jest --runInBand --passWithNoTests"
  }
}
```

Create `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "types": ["miniprogram-api-typings", "jest"],
    "paths": {
      "@/*": ["miniprogram/*"]
    }
  },
  "include": ["miniprogram/**/*.ts", "tests/**/*.ts"]
}
```

Create `jest.config.cjs` with:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/miniprogram/$1',
  },
};
```

- [ ] **Step 4: Create the minimal Mini Program shell**

Use this app config:

```json
{
  "pages": [
    "pages/home/index"
  ],
  "window": {
    "navigationBarTitleText": "任务清单",
    "navigationBarBackgroundColor": "#f7f4ee",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f7f4ee"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

Create `project.config.json` with:

```json
{
  "appid": "touristappid",
  "compileType": "miniprogram",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "es6": true,
    "minified": true,
    "enhance": true,
    "postcss": true
  }
}
```

Create `miniprogram/pages/home/index.wxml` with:

```xml
<view class="page">
  <text class="title">任务清单</text>
  <text class="subtitle">Mini Program scaffold ready</text>
</view>
```

- [ ] **Step 5: Ignore local artifacts**

Ensure `.gitignore` includes:

```gitignore
node_modules/
dist/
miniprogram_npm/
.DS_Store
.superpowers/
.worktrees/
```

- [ ] **Step 6: Verify baseline toolchain**

Run:

```bash
npm run typecheck
npm test
```

Expected: typecheck passes and Jest reports no tests found with exit code `0`.

- [ ] **Step 7: Commit the scaffold**

```bash
git add package.json package-lock.json tsconfig.json jest.config.cjs project.config.json .gitignore miniprogram
git commit -m "chore: bootstrap wechat miniprogram workspace"
```

### Task 2: Establish Date Utilities with TDD

**Files:**
- Create: `miniprogram/utils/date/local-date.ts`
- Create: `miniprogram/utils/date/due-date-key.ts`
- Create: `miniprogram/utils/date/month-window.ts`
- Create: `tests/utils/local-date.test.ts`
- Create: `tests/utils/due-date-key.test.ts`
- Create: `tests/utils/month-window.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing `LocalDate` tests**

```ts
import { LocalDate } from '@/utils/date/local-date';

describe('LocalDate', () => {
  it('keeps the provided year month and day', () => {
    const date = new LocalDate(2026, 3, 18);
    expect(date.year).toBe(2026);
    expect(date.month).toBe(3);
    expect(date.day).toBe(18);
  });
});
```

- [ ] **Step 2: Run the test to verify failure**

Run:

```bash
npm test -- tests/utils/local-date.test.ts
```

Expected: fail with module not found for `@/utils/date/local-date`.

- [ ] **Step 3: Implement `LocalDate` minimally**

```ts
export class LocalDate {
  constructor(
    public readonly year: number,
    public readonly month: number,
    public readonly day: number,
  ) {}
}
```

- [ ] **Step 4: Add and run failing `dueDateKey` tests**

```ts
import { toDueDateKey } from '@/utils/date/due-date-key';
import { LocalDate } from '@/utils/date/local-date';

it('formats YYYY-MM-DD', () => {
  expect(toDueDateKey(new LocalDate(2026, 3, 8))).toBe('2026-03-08');
});
```

Run:

```bash
npm test -- tests/utils/due-date-key.test.ts
```

Expected: fail until formatter exists.

- [ ] **Step 5: Implement `toDueDateKey` and parse helpers**

```ts
export function toDueDateKey(date: LocalDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}
```

- [ ] **Step 6: Add and run failing `monthWindow` tests**

Write tests that verify:

- March 2026 produces 42 cells
- the first row backfills previous-month dates
- selecting next/previous month clamps invalid dates correctly

Run:

```bash
npm test -- tests/utils/month-window.test.ts
```

- [ ] **Step 7: Implement month-window helpers**

Export:

- `buildMonthWindow(date: LocalDate): LocalDate[]`
- `shiftMonth(date: LocalDate, delta: number): LocalDate`
- `isSameLocalDate(a: LocalDate, b: LocalDate): boolean`

- [ ] **Step 8: Run the whole date utility suite**

Run:

```bash
npm test -- tests/utils/local-date.test.ts tests/utils/due-date-key.test.ts tests/utils/month-window.test.ts
```

Expected: all date tests pass.

- [ ] **Step 9: Commit**

```bash
git add miniprogram/utils/date tests/utils
git commit -m "feat: add date helpers for month view"
```

### Task 3: Replace the Placeholder with App Bootstrap and User Session Logic

**Files:**
- Create: `miniprogram/models/user.ts`
- Create: `miniprogram/services/cloud.ts`
- Create: `miniprogram/services/user-service.ts`
- Create: `miniprogram/stores/app-store.ts`
- Modify: `miniprogram/app.ts`
- Modify: `miniprogram/pages/home/index.ts`
- Modify: `miniprogram/pages/home/index.wxml`
- Create: `tests/services/user-service.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing user-service tests**

```ts
import { normalizeUserRecord } from '@/services/user-service';

it('maps a cloud user record to app session data', () => {
  expect(normalizeUserRecord({
    userId: 'u1',
    nickname: 'A',
    currentSpaceId: null,
  })).toEqual({
    userId: 'u1',
    nickname: 'A',
    currentSpaceId: null,
  });
});
```

- [ ] **Step 2: Run the test to verify failure**

Run:

```bash
npm test -- tests/services/user-service.test.ts
```

- [ ] **Step 3: Implement `cloud.ts` and `user-service.ts`**

Create `initCloud()` in `cloud.ts`:

```ts
export function initCloud(): void {
  if (!wx.cloud) {
    throw new Error('wx.cloud unavailable');
  }
  wx.cloud.init({ traceUser: true });
}
```

Create `normalizeUserRecord()` and `loadCurrentUser()` in `user-service.ts`.

- [ ] **Step 4: Initialize cloud in `app.ts`**

Set `app.ts` to:

```ts
import { initCloud } from '@/services/cloud';

App({
  onLaunch() {
    initCloud();
  },
});
```

- [ ] **Step 5: Replace the placeholder home page with bootstrap state**

Show three states in `home/index.wxml`:

- loading
- ready
- bootstrap error

- [ ] **Step 6: Run typecheck and user-service tests**

Run:

```bash
npm run typecheck
npm test -- tests/services/user-service.test.ts
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add miniprogram/app.ts miniprogram/pages/home miniprogram/models miniprogram/services miniprogram/stores tests/services/user-service.test.ts
git commit -m "feat: add miniprogram bootstrap and user session loading"
```

### Task 4: Implement Pairing and Invite Flow Domain

**Files:**
- Create: `miniprogram/models/space.ts`
- Create: `miniprogram/services/space-service.ts`
- Create: `cloudfunctions/_shared/db.js`
- Create: `cloudfunctions/_shared/guards.js`
- Create: `cloudfunctions/createSpaceInvite/index.js`
- Create: `cloudfunctions/createSpaceInvite/package.json`
- Create: `cloudfunctions/acceptSpaceInvite/index.js`
- Create: `cloudfunctions/acceptSpaceInvite/package.json`
- Create: `tests/services/space-service.test.ts`
- Create: `tests/integration/invite-flow.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing invite validation tests**

```ts
import { canCreateInvite } from '@/services/space-service';

it('allows invite creation when the user has no active partner', () => {
  expect(canCreateInvite({ currentSpaceId: null })).toBe(true);
});

it('blocks invite creation when already in an active space', () => {
  expect(canCreateInvite({ currentSpaceId: 'space-1' })).toBe(false);
});
```

- [ ] **Step 2: Run the space-service tests to verify failure**

Run:

```bash
npm test -- tests/services/space-service.test.ts
```

- [ ] **Step 3: Implement the client-side space service**

Export:

- `canCreateInvite(user)`
- `createSpaceInvite()`
- `acceptSpaceInvite(inviteId)`

Client calls should proxy to cloud functions through `wx.cloud.callFunction`.

- [ ] **Step 4: Write the cloud-function integration tests**

Cover these cases:

- create pending space and invite for a solo user
- reject invite acceptance if invite is expired
- reject invite acceptance if the second user is already in a space
- mark the space `active` once the second user joins

- [ ] **Step 5: Implement shared guards and both invite cloud functions**

`guards.js` should expose:

- `assertUserNotInSpace(userId)`
- `assertInviteUsable(inviteRecord)`
- `assertSpaceJoinable(spaceRecord)`

Each function folder should contain:

```json
{
  "dependencies": {
    "wx-server-sdk": "^3.0.1"
  }
}
```

- [ ] **Step 6: Run invite tests**

Run:

```bash
npm test -- tests/services/space-service.test.ts tests/integration/invite-flow.test.ts
```

Expected: all invite tests pass.

- [ ] **Step 7: Commit**

```bash
git add miniprogram/models/space.ts miniprogram/services/space-service.ts cloudfunctions tests/services/space-service.test.ts tests/integration/invite-flow.test.ts
git commit -m "feat: add dual-user invite and pairing flow"
```

### Task 5: Add List and Task Domain Rules

**Files:**
- Create: `miniprogram/models/list.ts`
- Create: `miniprogram/models/task.ts`
- Create: `miniprogram/services/list-service.ts`
- Create: `miniprogram/services/task-service.ts`
- Create: `miniprogram/utils/permissions.ts`
- Create: `cloudfunctions/upsertTask/index.js`
- Create: `cloudfunctions/upsertTask/package.json`
- Create: `cloudfunctions/toggleTaskCompletion/index.js`
- Create: `cloudfunctions/toggleTaskCompletion/package.json`
- Create: `cloudfunctions/manageList/index.js`
- Create: `cloudfunctions/manageList/package.json`
- Create: `tests/utils/permissions.test.ts`
- Create: `tests/services/task-service.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing permission tests**

```ts
import { canUseListForTask } from '@/utils/permissions';

it('allows shared list usage for members of the same space', () => {
  expect(canUseListForTask({
    viewerUserId: 'u1',
    listType: 'shared',
    listOwnerUserId: 'u1',
    taskSpaceId: 's1',
    viewerSpaceId: 's1',
  })).toBe(true);
});

it('blocks writing into the other users private list', () => {
  expect(canUseListForTask({
    viewerUserId: 'u1',
    listType: 'private',
    listOwnerUserId: 'u2',
    taskSpaceId: null,
    viewerSpaceId: 's1',
  })).toBe(false);
});
```

- [ ] **Step 2: Run permission tests to verify failure**

Run:

```bash
npm test -- tests/utils/permissions.test.ts
```

- [ ] **Step 3: Implement `permissions.ts`**

Export:

- `canViewList()`
- `canUseListForTask()`
- `normalizeAssigneeUserIds()`

- [ ] **Step 4: Write the failing task-service tests**

Cover:

- querying month tasks by `dueDateKey`
- filtering home data to `all`, `shared`, and `mine`
- mapping cloud docs to typed task models

- [ ] **Step 5: Implement list and task services plus cloud functions**

Permission-sensitive writes must route through:

- `manageList`
- `upsertTask`
- `toggleTaskCompletion`

Pure reads may use cloud database queries directly.

- [ ] **Step 6: Run domain tests**

Run:

```bash
npm test -- tests/utils/permissions.test.ts tests/services/task-service.test.ts
```

Expected: pass with green suite.

- [ ] **Step 7: Commit**

```bash
git add miniprogram/models/list.ts miniprogram/models/task.ts miniprogram/services/list-service.ts miniprogram/services/task-service.ts miniprogram/utils/permissions.ts cloudfunctions tests/utils/permissions.test.ts tests/services/task-service.test.ts
git commit -m "feat: add list and task domain rules"
```

### Task 6: Add Offline Cache and Replay Queue

**Files:**
- Create: `miniprogram/utils/storage.ts`
- Create: `miniprogram/utils/sync-queue.ts`
- Create: `miniprogram/services/network-service.ts`
- Create: `miniprogram/services/sync-service.ts`
- Create: `tests/utils/sync-queue.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing sync-queue tests**

```ts
import { SyncQueue } from '@/utils/sync-queue';

it('replays queued operations in insertion order', () => {
  const queue = new SyncQueue();
  queue.enqueue({ id: '1', type: 'toggleTaskCompletion' });
  queue.enqueue({ id: '2', type: 'upsertTask' });

  expect(queue.peekAll().map(item => item.id)).toEqual(['1', '2']);
});
```

- [ ] **Step 2: Run the sync-queue tests**

Run:

```bash
npm test -- tests/utils/sync-queue.test.ts
```

- [ ] **Step 3: Implement storage and queue helpers**

Add:

- `loadJson<T>(key)`
- `saveJson(key, value)`
- `SyncQueue.enqueue()`
- `SyncQueue.dequeue()`
- `SyncQueue.replaceAll()`

- [ ] **Step 4: Add `network-service.ts` and `sync-service.ts`**

`sync-service.ts` should expose:

- `queueTaskMutation()`
- `flushPendingOperations()`
- `rehydrateCachedHomeState()`

- [ ] **Step 5: Add failure and retry tests**

Cover:

- failed replay stays in queue
- successful replay removes item
- cached month data round-trips through storage

- [ ] **Step 6: Run queue and storage tests**

Run:

```bash
npm test -- tests/utils/sync-queue.test.ts
```

Expected: queue suite passes.

- [ ] **Step 7: Commit**

```bash
git add miniprogram/utils/storage.ts miniprogram/utils/sync-queue.ts miniprogram/services/network-service.ts miniprogram/services/sync-service.ts tests/utils/sync-queue.test.ts
git commit -m "feat: add offline cache and sync queue"
```

### Task 7: Build the Home Store and Month-View UI

**Files:**
- Create: `miniprogram/stores/home-store.ts`
- Create: `miniprogram/components/month-header/index.ts`
- Create: `miniprogram/components/month-header/index.wxml`
- Create: `miniprogram/components/month-header/index.wxss`
- Create: `miniprogram/components/month-header/index.json`
- Create: `miniprogram/components/month-grid/index.ts`
- Create: `miniprogram/components/month-grid/index.wxml`
- Create: `miniprogram/components/month-grid/index.wxss`
- Create: `miniprogram/components/month-grid/index.json`
- Create: `miniprogram/components/day-task-list/index.ts`
- Create: `miniprogram/components/day-task-list/index.wxml`
- Create: `miniprogram/components/day-task-list/index.wxss`
- Create: `miniprogram/components/day-task-list/index.json`
- Create: `miniprogram/components/task-item/index.ts`
- Create: `miniprogram/components/task-item/index.wxml`
- Create: `miniprogram/components/task-item/index.wxss`
- Create: `miniprogram/components/task-item/index.json`
- Modify: `miniprogram/pages/home/index.ts`
- Modify: `miniprogram/pages/home/index.wxml`
- Modify: `miniprogram/pages/home/index.wxss`
- Create: `tests/stores/home-store.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing home-store tests**

Cover:

- default selected date is today
- month summaries group tasks by `dueDateKey`
- scope filter `all` excludes the partner's private lists
- tapping a new date updates the day-detail list

- [ ] **Step 2: Run the home-store tests**

Run:

```bash
npm test -- tests/stores/home-store.test.ts
```

- [ ] **Step 3: Implement `home-store.ts`**

Expose:

- `selectedDate`
- `visibleScope`
- `monthCells`
- `selectedDayTasks`
- `selectDate()`
- `goToToday()`
- `shiftMonth(delta)`
- `setVisibleScope(scope)`

- [ ] **Step 4: Implement the home components and page bindings**

Use the visual structure from the approved spec:

- month header at the top
- 6x7 grid in the middle
- selected-day task list at the bottom
- floating add button

- [ ] **Step 5: Run the home-store tests and typecheck**

Run:

```bash
npm test -- tests/stores/home-store.test.ts
npm run typecheck
```

Expected: store tests and typecheck pass.

- [ ] **Step 6: Smoke-check the page in WeChat DevTools**

Verify manually:

- the month title renders
- `全部 / 共享 / 我的` toggles appear
- selecting a day updates the detail area

- [ ] **Step 7: Commit**

```bash
git add miniprogram/stores/home-store.ts miniprogram/components miniprogram/pages/home tests/stores/home-store.test.ts
git commit -m "feat: add month view home page"
```

### Task 8: Add Task Editor and List Manager Pages

**Files:**
- Create: `miniprogram/pages/task-editor/index.ts`
- Create: `miniprogram/pages/task-editor/index.wxml`
- Create: `miniprogram/pages/task-editor/index.wxss`
- Create: `miniprogram/pages/task-editor/index.json`
- Create: `miniprogram/pages/list-manager/index.ts`
- Create: `miniprogram/pages/list-manager/index.wxml`
- Create: `miniprogram/pages/list-manager/index.wxss`
- Create: `miniprogram/pages/list-manager/index.json`
- Create: `miniprogram/utils/task-editor-options.ts`
- Modify: `miniprogram/app.json`
- Create: `tests/utils/task-editor-options.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing task-editor option tests**

Cover:

- new task inherits the currently selected date
- solo users only see self-assignment
- paired users can choose shared list or their own private list

- [ ] **Step 2: Run the task-editor option tests**

Run:

```bash
npm test -- tests/utils/task-editor-options.test.ts
```

- [ ] **Step 3: Implement the task-editor page**

The form must expose:

- title input
- date picker
- list picker
- assignee picker
- save action

- [ ] **Step 4: Implement the list-manager page**

The page must allow:

- creating a private list
- creating a shared list when a pair exists
- renaming an existing list

- [ ] **Step 5: Run the editor-option tests and typecheck**

Run:

```bash
npm run typecheck
npm test -- tests/utils/task-editor-options.test.ts
```

Expected: both pass.

- [ ] **Step 6: Smoke-check both pages in WeChat DevTools**

Verify manually:

- creating a new task preselects the current day
- solo state hides partner/both assignment
- paired state shows shared-list and assignee options
- list manager can create and rename lists

- [ ] **Step 7: Commit**

```bash
git add miniprogram/app.json miniprogram/pages/task-editor miniprogram/pages/list-manager miniprogram/utils/task-editor-options.ts tests/utils/task-editor-options.test.ts
git commit -m "feat: add task editor and list management"
```

### Task 9: Add Invite Acceptance Page and Share Entry Logic

**Files:**
- Modify: `miniprogram/app.json`
- Create: `miniprogram/pages/invite/index.ts`
- Create: `miniprogram/pages/invite/index.wxml`
- Create: `miniprogram/pages/invite/index.wxss`
- Create: `miniprogram/pages/invite/index.json`
- Modify: `miniprogram/pages/home/index.ts`
- Modify: `miniprogram/pages/home/index.wxml`
- Modify: `tests/integration/invite-flow.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Extend invite-flow tests with page-entry coverage**

Add expectations for:

- receiving `inviteId` in route params
- showing loading while acceptance runs
- redirecting back to home after success
- showing actionable error text on failure

- [ ] **Step 2: Run the invite-flow tests**

Run:

```bash
npm test -- tests/integration/invite-flow.test.ts
```

- [ ] **Step 3: Implement the invite page**

The invite page should:

- parse `inviteId`
- call `acceptSpaceInvite()`
- show success or error state
- redirect to home once binding completes

- [ ] **Step 4: Add the invite entry point from home**

The home page should expose:

- solo-state CTA: `邀请搭子一起用`
- `onShareAppMessage` payload containing the current invite id

- [ ] **Step 5: Run the invite suite again**

Run:

```bash
npm test -- tests/integration/invite-flow.test.ts
```

Expected: passes with home-entry and invite-accept coverage.

- [ ] **Step 6: Commit**

```bash
git add miniprogram/app.json miniprogram/pages/invite miniprogram/pages/home tests/integration/invite-flow.test.ts
git commit -m "feat: add invite page and share entry flow"
```

### Task 10: Wire Offline Replay into Task Mutations and Finish Smoke Coverage

**Files:**
- Modify: `miniprogram/services/task-service.ts`
- Modify: `miniprogram/services/sync-service.ts`
- Modify: `miniprogram/stores/home-store.ts`
- Create: `tests/integration/offline-sync.test.ts`

**Sub-skill:** `@superpowers/test-driven-development`

- [ ] **Step 1: Write the failing offline-sync integration test**

Cover:

- cached home data loads while offline
- toggling a task while offline updates local state immediately
- queued operation flushes when the network recovers
- queue drains after successful replay

- [ ] **Step 2: Run the offline-sync test**

Run:

```bash
npm test -- tests/integration/offline-sync.test.ts
```

- [ ] **Step 3: Implement sync hooks inside task mutations**

`task-service.ts` should:

- write local state first
- queue cloud mutations if offline
- invoke `flushPendingOperations()` on reconnect

- [ ] **Step 4: Rehydrate cached month data on home bootstrap**

`home-store.ts` should:

- load cached month data before remote fetch resolves
- reconcile remote data once online data arrives

- [ ] **Step 5: Run the focused integration suite**

Run:

```bash
npm test -- tests/integration/offline-sync.test.ts tests/integration/invite-flow.test.ts
npm run typecheck
```

Expected: both integration tests pass and typecheck stays green.

- [ ] **Step 6: Run the full suite**

Run:

```bash
npm test
```

Expected: full Jest suite passes.

- [ ] **Step 7: Commit**

```bash
git add miniprogram/services/task-service.ts miniprogram/services/sync-service.ts miniprogram/stores/home-store.ts tests/integration/offline-sync.test.ts
git commit -m "feat: finish offline replay and smoke coverage"
```

## Plan Review Notes

- Review this plan against `docs/superpowers/specs/2026-03-18-wechat-miniprogram-todo-design.md` before execution.
- If tests or DevTools setup expose a mismatch, fix the plan first rather than improvising during implementation.
- If cloud function local testing becomes awkward, keep pure business rules in shared modules that Jest can exercise directly.
