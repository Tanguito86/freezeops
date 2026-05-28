# Shmup Demo — FreezeOps Example

A tiny HTML5 shoot-em-up codebase that shows how FreezeOps protects
sensitive game code from AI-assisted changes.

## The Setup

```
src/
├── gameplay/player.js   ← PROTECTED: core gameplay logic
├── engine/loop.js       ← PROTECTED: game loop, timing critical
└── ui/menu.js           ← SAFE: feel free to edit
```

## The Rules

```yaml
# freezeops.yml
rules:
  - type: max_changed_lines
    value: 50

  - type: protected_paths
    paths:
      - src/gameplay/**
      - src/engine/**

  - type: forbidden_text
    patterns:
      - setInterval
      - eval(
      - TODO_THROWAWAY
```

## Try It

```bash
cd examples/shmup-demo
node ../../packages/cli/dist/index.js --config freezeops.yml
```

### Expect: PASS

```bash
# Editing the menu is safe
echo "// new menu item" >> src/ui/menu.js
node ../../packages/cli/dist/index.js --config freezeops.yml
# → FreezeOps check PASS
```

### Expect: FAIL — protected path

```bash
# Touching gameplay triggers protected_paths
echo "// tweaked player speed" >> src/gameplay/player.js
node ../../packages/cli/dist/index.js --config freezeops.yml
# → FreezeOps check FAIL
# → - [protected_paths] Modified protected path
```

### Expect: FAIL — forbidden pattern

```bash
# Adding setInterval triggers forbidden_text
echo "setInterval(gameLoop, 16);" >> src/engine/loop.js
node ../../packages/cli/dist/index.js --config freezeops.yml
# → FreezeOps check FAIL
# → - [forbidden_text] Forbidden pattern detected
```

## Why This Matters

Claude, Cursor, or Copilot might suggest "optimizing" the game loop
with `setInterval`. FreezeOps blocks that change before it reaches
code review — deterministically, no AI involved.
