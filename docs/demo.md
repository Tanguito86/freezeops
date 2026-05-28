# Demo: Shmup Game

FreezeOps ships with a demo project that shows exactly what the tool
does in 60 seconds — no setup, no cloud, no accounts.

## The Story

You're building a shoot-em-up game. The gameplay and engine code are
battle-tested and must not change without review. But the UI code is
new and evolving fast.

You use Claude Code or Cursor to build the menu. The AI sometimes
suggests "improvements" to the game loop — like replacing
`requestAnimationFrame` with `setInterval`. That would break frame
timing.

**FreezeOps catches this before it reaches review.**

## Demo Structure

```
examples/shmup-demo/
├── freezeops.yml               ← 3 rules protecting gameplay + engine
├── README.md                   ← demo walkthrough
└── src/
    ├── gameplay/player.js      ← PROTECTED
    ├── engine/loop.js          ← PROTECTED + setInterval forbidden
    └── ui/menu.js              ← SAFE to edit
```

## Expected Pass

Editing `src/ui/menu.js`:

```
FreezeOps check PASS
Files checked: 1
Rules checked: 3
Violations: 0
```

## Expected Fail — protected path

Editing `src/gameplay/player.js`:

```
FreezeOps check FAIL
Files checked: 1
Rules checked: 3
Violations: 1

- [protected_paths] Modified protected path
  file: src/gameplay/player.js
  detail: matched glob: src/gameplay/**
```

## Expected Fail — forbidden pattern

Adding `setInterval` to `src/engine/loop.js`:

```
FreezeOps check FAIL
Files checked: 1
Rules checked: 3
Violations: 1

- [forbidden_text] Forbidden pattern detected
  file: src/engine/loop.js
  detail: "setInterval"
```

## Running the Demo

```bash
git clone https://github.com/tanguito/freezeops.git
cd freezeops
npm install && npm run build

cd examples/shmup-demo

# Should pass (clean state)
node ../../packages/cli/dist/index.js --config freezeops.yml

# Trigger a violation
echo "// oops" >> src/gameplay/player.js
node ../../packages/cli/dist/index.js --config freezeops.yml
# → FAIL: protected_paths

# Clean up
git checkout src/gameplay/player.js
```

## What FreezeOps is NOT doing

- ❌ Not analyzing code quality
- ❌ Not using AI to decide if a change is safe
- ❌ Not replacing code review

It's just enforcing the boundaries **you** defined — deterministically.
