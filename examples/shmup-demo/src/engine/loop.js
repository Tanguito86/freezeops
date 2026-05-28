/**
 * Game loop — CORE ENGINE.
 *
 * PROTECTED by FreezeOps. Uses requestAnimationFrame because
 * timer shortcuts are forbidden (they drift and can't be paused).
 *
 * Try adding the forbidden timer function here and run FreezeOps —
 * it'll block you.
 */

var lastTime = 0;

function gameLoop(timestamp) {
  var delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render();

  requestAnimationFrame(gameLoop);
}

function update(delta) {
  // game state update
}

function render() {
  // draw frame
}

requestAnimationFrame(gameLoop);
