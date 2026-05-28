/**
 * Player controller — CORE GAMEPLAY.
 *
 * PROTECTED by FreezeOps. Any change to this file or anything under
 * src/gameplay/ must be reviewed carefully. AI coding tools tend to
 * "improve" things here — FreezeOps blocks those changes by default.
 */

export class Player {
  constructor() {
    this.x = 200;
    this.y = 500;
    this.speed = 5;
    this.lives = 3;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  moveRight() {
    this.x += this.speed;
  }

  shoot() {
    // projectile logic — don't touch without review
  }

  takeDamage() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.die();
    }
  }

  die() {
    // game over logic
  }
}
// tweak
// tweak
// tweak
