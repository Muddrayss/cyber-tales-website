/* /src/games/catch/CatchScene.ts
   Catch & Clean — Scene Phaser 3
   - loop 60s, score+combo, 3 difficoltà
   - comandi: ← → o trascina col mouse/touch
   - pooling oggetti (good/bad)
   - evento finale: window.dispatchEvent('ARCADE:GAME_OVER', { score })
*/

import Phaser from 'phaser';

/** Difficoltà supportate */
export type CatchDifficulty = 'junior' | 'standard' | 'pro';

/** Parametri di boot della Scene */
export interface CatchSceneConfig {
  difficulty?: CatchDifficulty;
}

/** Config per difficoltà (spawn rate, velocità, punteggio, durata) */
const DIFF: Record<
  CatchDifficulty,
  {
    spawnMsRange: [number, number];
    fallSpeed: { min: number; max: number };
    goodRatio: number; // percentuale oggetti buoni (0..1)
    durationSec: number; // durata partita
    badPenalty: number; // penalità quando prendi un cattivo
    baseScore: number; // punti base per oggetto buono
    comboBonus: number; // bonus per streak
  }
> = {
  junior: {
    spawnMsRange: [500, 850],
    fallSpeed: { min: 160, max: 220 },
    goodRatio: 0.75,
    durationSec: 60,
    badPenalty: 20,
    baseScore: 10,
    comboBonus: 2,
  },
  standard: {
    spawnMsRange: [420, 740],
    fallSpeed: { min: 200, max: 280 },
    goodRatio: 0.6,
    durationSec: 60,
    badPenalty: 25,
    baseScore: 12,
    comboBonus: 3,
  },
  pro: {
    spawnMsRange: [340, 620],
    fallSpeed: { min: 240, max: 340 },
    goodRatio: 0.5,
    durationSec: 60,
    badPenalty: 30,
    baseScore: 14,
    comboBonus: 4,
  },
};

/** Keys delle texture generate a runtime */
const TEX = {
  basket: 'ct_basket',
  good: 'ct_good',
  bad: 'ct_bad',
} as const;

/** Evento globale emesso a fine partita */
const EVENT_GAME_OVER = 'ARCADE:GAME_OVER';

/** Utility clamp */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Oggetto “cadente” nel pool */
type DropData = {
  kind: 'good' | 'bad';
  value: number; // per futuri bonus
};

export default class CatchScene extends Phaser.Scene {
  private cfg: Required<CatchSceneConfig>;
  private basket!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private drops!: Phaser.Physics.Arcade.Group; // pool condiviso good/bad
  private score = 0;
  private combo = 0;
  private timeLeft = 0;
  private hud!: {
    score: Phaser.GameObjects.Text;
    combo: Phaser.GameObjects.Text;
    timeBarBg: Phaser.GameObjects.Rectangle;
    timeBar: Phaser.GameObjects.Rectangle;
  };
  private spawnTimer?: Phaser.Time.TimerEvent;
  private endTimer?: Phaser.Time.TimerEvent;
  private pointerX: number | null = null; // controller touch/drag

  constructor(config?: CatchSceneConfig) {
    super('CatchScene');
    this.cfg = { difficulty: config?.difficulty ?? 'junior' };
  }

  /* ----------------------------- Phaser lifecycle ---------------------------- */

  preload() {
    this.createRuntimeTextures();
  }

  create() {
    // Background semplice
    this.add
      .rectangle(this.midX(), this.midY(), this.w(), this.h(), 0x0b1020)
      .setDepth(-10);

    // Basket (player)
    this.basket = this.physics.add
      .image(this.midX(), this.h() - 40, TEX.basket)
      .setImmovable(true);
    this.basket.setCollideWorldBounds(true);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    this.setupPointerController();

    // Pool cadute
    this.drops = this.physics.add.group({
      defaultKey: TEX.good,
      maxSize: 64,
      runChildUpdate: false,
    });

    // Overlap basket ↔ drops
    this.physics.add.overlap(this.basket, this.drops, (_player, obj) => {
      const s = obj as Phaser.Types.Physics.Arcade.ImageWithDynamicBody & {
        data?: DropData;
      };
      this.onCatch(s);
    });

    // HUD
    this.hud = this.createHud();

    // Timer partita
    const duration = DIFF[this.cfg.difficulty].durationSec;
    this.timeLeft = duration;
    this.endTimer = this.time.addEvent({
      delay: duration * 1000,
      callback: () => this.finish(),
    });

    // Spawn loop (random delay ad ogni iterazione)
    this.scheduleNextSpawn();

    // Leggera progressione: aumenta la velocità ogni 10s
    this.time.addEvent({
      delay: 10_000,
      loop: true,
      callback: () => {
        const d = DIFF[this.cfg.difficulty];
        d.fallSpeed.min *= 1.05;
        d.fallSpeed.max *= 1.05;
      },
    });
  }

  update(_: number, __: number) {
    // Timer HUD
    this.timeLeft = Math.max(
      0,
      this.endTimer ? this.endTimer.getRemaining() / 1000 : 0
    );
    this.updateHud();

    // Controlli tastiera
    const speed = 420;
    if (this.cursors.left?.isDown) {
      this.basket.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.basket.setVelocityX(speed);
    } else if (this.pointerX != null) {
      // Controllo pointer: muove verso la X del dito/cursore
      const dx = this.pointerX - this.basket.x;
      this.basket.setVelocityX(clamp(dx * 8, -speed, speed));
    } else {
      this.basket.setVelocityX(0);
    }

    // Recycle oggetti usciti dallo schermo
    this.drops.children.iterate((child) => {
      const s = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody & {
        data?: DropData;
      };
      if (!s.active) return null;
      if (s.y > this.h() + 40) {
        // Miss: se è buono, azzera combo ma non penalizza punteggio
        if (s.data?.kind === 'good') this.combo = 0;
        this.recycle(s);
      }
      return null;
    });
  }

  /* --------------------------------- Helpers -------------------------------- */

  private createRuntimeTextures() {
    // Basket
    const g1 = this.add.graphics();
    g1.fillStyle(0x9aa4ff, 1);
    g1.fillRoundedRect(0, 0, 96, 22, 8);
    g1.lineStyle(3, 0xffffff, 0.95);
    g1.strokeRoundedRect(0, 0, 96, 22, 8);
    g1.generateTexture(TEX.basket, 96, 22);
    g1.destroy();

    // Good (verde)
    const g2 = this.add.graphics();
    g2.fillStyle(0x2ecc71, 1);
    g2.fillCircle(14, 14, 14);
    g2.lineStyle(3, 0xffffff, 0.95);
    g2.strokeCircle(14, 14, 14);
    g2.generateTexture(TEX.good, 28, 28);
    g2.destroy();

    // Bad (rosso)
    const g3 = this.add.graphics();
    g3.fillStyle(0xe74c3c, 1);
    g3.fillTriangle(16, 0, 32, 28, 0, 28);
    g3.lineStyle(3, 0xffffff, 0.95);
    g3.strokeTriangle(16, 0, 32, 28, 0, 28);
    g3.generateTexture(TEX.bad, 32, 28);
    g3.destroy();
  }

  private setupPointerController() {
    // Segue il dito/mouse (solo X). Pointer move: docs+examples ufficiali.
    // https://phaser.io/examples/v3.85.0/input/pointer/view/move-event
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.pointerX = p.x;
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.pointerX = p.x;
    });
    this.input.on('pointerup', () => {
      this.pointerX = null;
    });
  }

  private createHud() {
    const pad = 14;
    const score = this.add
      .text(pad, pad, 'Punti: 0', { fontSize: '20px', color: '#ffffff' })
      .setDepth(10);
    const combo = this.add
      .text(pad, pad + 26, 'Combo ×1', { fontSize: '16px', color: '#9aa4ff' })
      .setDepth(10);

    const timeBarBg = this.add
      .rectangle(this.w() - 220, pad + 12, 200, 10, 0xffffff)
      .setAlpha(0.25)
      .setOrigin(0, 0.5);
    const timeBar = this.add
      .rectangle(this.w() - 220, pad + 12, 200, 10, 0x9aa4ff)
      .setOrigin(0, 0.5);
    return { score, combo, timeBarBg, timeBar };
  }

  private updateHud() {
    this.hud.score.setText(`Punti: ${this.score}`);
    const mult = Math.max(1, 1 + Math.floor(this.combo / 3));
    this.hud.combo.setText(`Combo ×${mult}`);

    // barra tempo
    const total = DIFF[this.cfg.difficulty].durationSec;
    const w = 200 * (this.timeLeft / total);
    this.hud.timeBar.width = clamp(w, 0, 200);
  }

  private scheduleNextSpawn() {
    const [a, b] = DIFF[this.cfg.difficulty].spawnMsRange;
    const delay = Phaser.Math.Between(a, b);
    // Timer Events doc: https://docs.phaser.io/phaser/concepts/time
    this.spawnTimer = this.time.delayedCall(delay, () => {
      this.spawnOnce();
      this.scheduleNextSpawn();
    });
  }

  private spawnOnce() {
    const conf = DIFF[this.cfg.difficulty];
    const isGood = Math.random() < conf.goodRatio;
    const key = isGood ? TEX.good : TEX.bad;

    // Object Pool: get dal group, senza creare/distruggere a ogni spawn
    // vedi: https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/
    const s = this.drops.get(
      0,
      0,
      key
    ) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody & { data?: DropData };
    if (!s) return;

    const margin = 24;
    const x = Phaser.Math.Between(margin, this.w() - margin);
    const y = -32;

    s.setActive(true).setVisible(true);
    s.enableBody(true, x, y, true, true);
    s.setDataEnabled();
	s.setData({ kind: isGood ? 'good' : 'bad', value: 1 });

    const speed = Phaser.Math.Between(conf.fallSpeed.min, conf.fallSpeed.max);
    s.setVelocity(0, speed);
    s.setBounce(0);
    s.setCollideWorldBounds(false);
  }

  private onCatch(
    s: Phaser.Types.Physics.Arcade.ImageWithDynamicBody & { data?: DropData }
  ) {
    if (!s.active) return;
    const conf = DIFF[this.cfg.difficulty];

    if (s.data?.kind === 'good') {
      this.combo += 1;
      const mult = 1 + Math.floor(this.combo / 3); // ogni 3 buoni ↑ moltiplicatore
      this.score += conf.baseScore * mult + conf.comboBonus;
      this.flash(this.basket, 0x2ecc71);
    } else {
      this.combo = 0;
      this.score = Math.max(0, this.score - conf.badPenalty);
      this.cameraShake(50);
      this.flash(this.basket, 0xe74c3c);
    }
    this.recycle(s);
  }

  private recycle(
    s: Phaser.Types.Physics.Arcade.ImageWithDynamicBody & { data?: DropData }
  ) {
    s.disableBody(true, true);
    s.setActive(false);
    s.setVisible(false);
  }

  private finish() {
    // stop spawn
    this.spawnTimer?.remove(false);

    // pulizia pool
    this.drops.children.iterate((child) => {
      const s = child as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      if (s.active) this.recycle(s as any);
      return null;
    });

    // dispatch punteggio globale
    window.dispatchEvent(
      new CustomEvent(EVENT_GAME_OVER, { detail: { score: this.score } })
    );
    // facoltativo: mostra overlay “Fine” qui se vuoi
  }

  /* ------------------------------- Effetti FX ------------------------------- */

  private flash(target: Phaser.GameObjects.GameObject, color: number) {
    const t = target as any;
    const origTint = t.tintTopLeft ?? 0xffffff;
    t.setTintFill?.(color);
    this.time.delayedCall(80, () => t.setTintFill?.(origTint));
  }

  private cameraShake(duration = 100) {
    this.cameras.main.shake(duration, 0.004);
  }

  /* ---------------------------- helpers dimensions ---------------------------- */

  private w() {
    return this.scale.width;
  }
  private h() {
    return this.scale.height;
  }
  private midX() {
    return this.w() * 0.5;
  }
  private midY() {
    return this.h() * 0.5;
  }
}
