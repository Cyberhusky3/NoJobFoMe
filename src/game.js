'use strict';

const CONFIG = {
  world: { width: 1280, height: 720, friction: 0.86 },
  player: { radius: 18, invulnerabilityMs: 450 },
  projectile: { radius: 5, speed: 760, life: 1.15 },
  pickup: { radius: 12, minHeal: 20, maxHeal: 30, life: 9 },
  wave: { baseInterval: 2.1, minInterval: 0.45, enemiesPerWave: 6, waveEverySeconds: 22 },
  xp: { baseRequired: 80, growth: 1.34 },
  drops: { healChance: 0.15 },
  audio: { enabled: true }
};

const CHARACTERS = [
  { id: 'soldier', name: 'Starter Soldier', unlockLevel: 1, color: '#38bdf8', maxHp: 100, speed: 265, damage: 24, fireRate: 4.5, regen: 0, description: 'Balanced stats and reliable single-shot weapon.' },
  { id: 'scout', name: 'Scout', unlockLevel: 3, color: '#a7f3d0', maxHp: 80, speed: 340, damage: 20, fireRate: 5.8, regen: 0, description: 'Faster movement speed, lower health.' },
  { id: 'heavy', name: 'Heavy Gunner', unlockLevel: 5, color: '#f59e0b', maxHp: 140, speed: 210, damage: 34, fireRate: 3.5, regen: 0, description: 'Higher health, slower movement, stronger weapon.' },
  { id: 'medic', name: 'Medic', unlockLevel: 7, color: '#f472b6', maxHp: 105, speed: 255, damage: 23, fireRate: 4.4, regen: 2.2, description: 'Passive health regeneration and medium damage.' }
];

const ENEMY_TYPES = {
  basic: { color: '#ef4444', radius: 16, hp: 42, speed: 86, damage: 12, xp: 18, score: 100 },
  fast: { color: '#f97316', radius: 12, hp: 28, speed: 146, damage: 9, xp: 15, score: 120 },
  tank: { color: '#8b5cf6', radius: 24, hp: 125, speed: 55, damage: 20, xp: 38, score: 260 }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = {
  mainMenu: document.getElementById('mainMenu'), characterMenu: document.getElementById('characterMenu'), hud: document.getElementById('hud'), gameOver: document.getElementById('gameOver'),
  healthFill: document.getElementById('healthFill'), healthText: document.getElementById('healthText'), xpFill: document.getElementById('xpFill'), levelText: document.getElementById('levelText'),
  scoreText: document.getElementById('scoreText'), waveText: document.getElementById('waveText'), timeText: document.getElementById('timeText'), upgradeText: document.getElementById('upgradeText'),
  finalScore: document.getElementById('finalScore'), finalTime: document.getElementById('finalTime'), characterCards: document.getElementById('characterCards')
};

const storage = {
  memory: new Map(),
  get(key, fallback) {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue === null ? fallback : storedValue;
    } catch (error) {
      return this.memory.has(key) ? this.memory.get(key) : fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      this.memory.set(key, String(value));
    }
  }
};


class SoundSystem {
  constructor() { this.context = null; }
  play(type) {
    if (!CONFIG.audio.enabled) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!this.context) this.context = new AudioCtor();
    if (this.context.state === 'suspended') this.context.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    const presets = { shoot: [620, 0.04, 'square', 0.025], hit: [160, 0.07, 'sawtooth', 0.035], heal: [820, 0.15, 'sine', 0.045], level: [440, 0.28, 'triangle', 0.05] };
    const [freq, duration, wave, volume] = presets[type] || presets.hit;
    osc.frequency.setValueAtTime(freq, now); osc.type = wave; gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(this.context.destination); osc.start(now); osc.stop(now + duration);
  }
}

class XPSystem {
  constructor() { this.level = 1; this.xp = 0; this.unlockedLevel = Number(storage.get('nojfm_maxLevel', '1')); }
  required() { return Math.floor(CONFIG.xp.baseRequired * Math.pow(CONFIG.xp.growth, this.level - 1)); }
  add(amount, game) { this.xp += amount; while (this.xp >= this.required()) { this.xp -= this.required(); this.level++; this.unlockedLevel = Math.max(this.unlockedLevel, this.level); storage.set('nojfm_maxLevel', this.unlockedLevel); game.onLevelUp(); } }
}

class CharacterUnlockSystem {
  constructor(xpSystem) { this.xpSystem = xpSystem; this.selectedId = storage.get('nojfm_character', 'soldier'); }
  isUnlocked(character) { return this.xpSystem.unlockedLevel >= character.unlockLevel; }
  selected() { return CHARACTERS.find(c => c.id === this.selectedId) || CHARACTERS[0]; }
  select(id) { const character = CHARACTERS.find(c => c.id === id); if (character && this.isUnlocked(character)) { this.selectedId = id; storage.set('nojfm_character', id); } }
}

class Player {
  constructor(character) { Object.assign(this, character); this.x = canvas.width / 2; this.y = canvas.height / 2; this.hp = this.maxHp; this.radius = CONFIG.player.radius; this.lastShot = 0; this.hitCooldown = 0; this.weaponLevel = 1; this.multishot = 1; }
  update(dt, input) { const dx = (input.keys.d || input.keys.ArrowRight ? 1 : 0) - (input.keys.a || input.keys.ArrowLeft ? 1 : 0); const dy = (input.keys.s || input.keys.ArrowDown ? 1 : 0) - (input.keys.w || input.keys.ArrowUp ? 1 : 0); const len = Math.hypot(dx, dy) || 1; this.x = clamp(this.x + dx / len * this.speed * dt, this.radius, canvas.width - this.radius); this.y = clamp(this.y + dy / len * this.speed * dt, this.radius, canvas.height - this.radius); this.hp = Math.min(this.maxHp, this.hp + this.regen * dt); this.hitCooldown = Math.max(0, this.hitCooldown - dt); }
  canShoot(time) { return time - this.lastShot >= 1 / this.fireRate; }
  heal(amount) { this.hp = Math.min(this.maxHp, this.hp + amount); }
  damage(amount) {
    if (this.hitCooldown > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.hitCooldown = CONFIG.player.invulnerabilityMs / 1000;
    return true;
  }
  draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = this.hitCooldown > 0 ? '#fff' : this.color; ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); const a = Math.atan2(game.input.mouse.y - this.y, game.input.mouse.x - this.x); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.stroke(); ctx.restore(); }
}

class Enemy { constructor(type, difficulty) { Object.assign(this, ENEMY_TYPES[type]); this.type = type; const edge = Math.floor(Math.random() * 4); this.x = edge < 2 ? Math.random() * canvas.width : (edge === 2 ? -30 : canvas.width + 30); this.y = edge >= 2 ? Math.random() * canvas.height : (edge === 0 ? -30 : canvas.height + 30); this.maxHp = this.hp = this.hp * difficulty.health; this.speed *= difficulty.speed; this.contactCooldown = 0; } update(dt, player) { this.contactCooldown = Math.max(0, this.contactCooldown - dt); const a = Math.atan2(player.y - this.y, player.x - this.x); this.x += Math.cos(a) * this.speed * dt; this.y += Math.sin(a) * this.speed * dt; } draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111827'; ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2, 4); ctx.fillStyle = '#22c55e'; ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2 * (this.hp / this.maxHp), 4); } }
class Projectile { constructor(x, y, angle, damage) { this.x = x; this.y = y; this.angle = angle; this.damage = damage; this.life = CONFIG.projectile.life; this.radius = CONFIG.projectile.radius; } update(dt) { this.x += Math.cos(this.angle) * CONFIG.projectile.speed * dt; this.y += Math.sin(this.angle) * CONFIG.projectile.speed * dt; this.life -= dt; } draw() { ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); } }
class Pickup { constructor(x, y) { this.x = x; this.y = y; this.radius = CONFIG.pickup.radius; this.life = CONFIG.pickup.life; this.amount = rand(CONFIG.pickup.minHeal, CONFIG.pickup.maxHeal); } update(dt) { this.life -= dt; } draw() { ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'white'; ctx.fillRect(this.x - 2, this.y - 7, 4, 14); ctx.fillRect(this.x - 7, this.y - 2, 14, 4); } }
class Particle { constructor(x, y, color, text = '') { this.x = x; this.y = y; this.color = color; this.text = text; this.life = 0.7; this.vx = rand(-45, 45); this.vy = rand(-70, -20); } update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt; } draw() { ctx.globalAlpha = Math.max(0, this.life / 0.7); ctx.fillStyle = this.color; this.text ? ctx.fillText(this.text, this.x, this.y) : ctx.fillRect(this.x, this.y, 4, 4); ctx.globalAlpha = 1; } }

class WaveManager { constructor() { this.wave = 1; this.timer = 0; this.spawnTimer = 0; } difficulty() { return { health: 1 + this.wave * 0.12, speed: 1 + this.wave * 0.035 }; } update(dt, game) { this.timer += dt; if (this.timer > CONFIG.wave.waveEverySeconds) { this.timer = 0; this.wave++; } this.spawnTimer -= dt; if (this.spawnTimer <= 0) { const interval = Math.max(CONFIG.wave.minInterval, CONFIG.wave.baseInterval - this.wave * 0.1); this.spawnTimer = interval; const count = 1 + Math.floor(this.wave / 4); for (let i = 0; i < count; i++) game.spawnEnemy(); } } }
class UIManager { renderCharacters(unlocks) { ui.characterCards.innerHTML = ''; CHARACTERS.forEach(c => { const locked = !unlocks.isUnlocked(c); const el = document.createElement('article'); el.className = `character-card ${locked ? 'locked' : ''} ${unlocks.selectedId === c.id ? 'selected' : ''}`; el.innerHTML = `<h3>${c.name}</h3><p>${c.description}</p><p>HP ${c.maxHp} • Speed ${c.speed} • Damage ${c.damage}</p><p>${locked ? `Unlocks at Level ${c.unlockLevel}` : 'Unlocked'}</p><button ${locked ? 'disabled' : ''}>${unlocks.selectedId === c.id ? 'Selected' : 'Select'}</button>`; el.querySelector('button').onclick = () => { unlocks.select(c.id); this.renderCharacters(unlocks); }; ui.characterCards.appendChild(el); }); } update(game) { const healthPercent = clamp(100 * game.player.hp / game.player.maxHp, 0, 100); ui.healthFill.style.width = `${healthPercent}%`; ui.healthText.textContent = `${Math.ceil(game.player.hp)} / ${game.player.maxHp}`; ui.xpFill.style.width = `${100 * game.xp.xp / game.xp.required()}%`; ui.levelText.textContent = `Level ${game.xp.level}`; ui.scoreText.textContent = `Score: ${game.score}`; ui.waveText.textContent = `Wave: ${game.wave.wave}`; ui.timeText.textContent = formatTime(game.elapsed); ui.upgradeText.textContent = `Weapon: Lv ${game.player.weaponLevel} • ${game.player.multishot} shot${game.player.multishot > 1 ? 's' : ''}`; } }

class Game { constructor() { this.sound = new SoundSystem(); this.xp = new XPSystem(); this.unlocks = new CharacterUnlockSystem(this.xp); this.ui = new UIManager(); this.input = { keys: {}, mouse: { x: canvas.width / 2, y: canvas.height / 2, down: false } }; this.bindEvents(); this.ui.renderCharacters(this.unlocks); this.reset(); requestAnimationFrame(t => this.loop(t)); }
  bindEvents() { window.addEventListener('keydown', e => { this.input.keys[e.key] = true; if (!this.running && (e.key === 'Enter' || e.key === ' ')) this.start(); }); window.addEventListener('keyup', e => this.input.keys[e.key] = false); canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); this.input.mouse.x = (e.clientX - r.left) * canvas.width / r.width; this.input.mouse.y = (e.clientY - r.top) * canvas.height / r.height; }); canvas.addEventListener('mousedown', () => this.input.mouse.down = true); window.addEventListener('mouseup', () => this.input.mouse.down = false); wireButton('startButton', () => this.start()); wireButton('characterButton', () => show(ui.characterMenu)); wireButton('backButton', () => show(ui.mainMenu)); wireButton('restartButton', () => this.start()); wireButton('menuButton', () => { hide(ui.gameOver); show(ui.mainMenu); }); window.addEventListener('resize', resizeCanvas); resizeCanvas(); }
  reset() { this.player = new Player(this.unlocks.selected()); this.enemies = []; this.projectiles = []; this.pickups = []; this.particles = []; this.wave = new WaveManager(); this.score = 0; this.elapsed = 0; this.running = false; }
  start() { this.reset(); this.running = true; hide(ui.mainMenu, ui.characterMenu, ui.gameOver); ui.hud.classList.remove('hidden'); }
  spawnEnemy() { const roll = Math.random(); const type = roll > 0.86 && this.wave.wave > 2 ? 'tank' : roll > 0.58 ? 'fast' : 'basic'; this.enemies.push(new Enemy(type, this.wave.difficulty())); }
  shoot(time) { if (!this.player.canShoot(time)) return; this.player.lastShot = time; const base = Math.atan2(this.input.mouse.y - this.player.y, this.input.mouse.x - this.player.x); for (let i = 0; i < this.player.multishot; i++) { const offset = (i - (this.player.multishot - 1) / 2) * 0.16; this.projectiles.push(new Projectile(this.player.x, this.player.y, base + offset, this.player.damage)); } this.sound.play('shoot'); }
  onLevelUp() { this.sound.play('level'); this.particles.push(new Particle(this.player.x, this.player.y - 25, '#fbbf24', 'LEVEL UP!')); const p = this.player; p.weaponLevel++; if (p.weaponLevel % 3 === 0) p.multishot = Math.min(5, p.multishot + 1); p.damage += 5; p.fireRate += 0.45; this.ui.renderCharacters(this.unlocks); }
  update(dt, time) { this.elapsed += dt; this.player.update(dt, this.input); if (this.input.mouse.down) this.shoot(time); this.wave.update(dt, this); this.projectiles.forEach(p => p.update(dt)); this.enemies.forEach(e => e.update(dt, this.player)); this.pickups.forEach(p => p.update(dt)); this.particles.forEach(p => p.update(dt)); this.handleCollisions(); this.projectiles = this.projectiles.filter(p => p.life > 0 && p.x > -30 && p.x < canvas.width + 30 && p.y > -30 && p.y < canvas.height + 30); this.pickups = this.pickups.filter(p => p.life > 0); this.particles = this.particles.filter(p => p.life > 0); if (this.player.hp <= 0) { this.end(); this.ui.update(this); return; } this.ui.update(this); }
  handleCollisions() { for (const enemy of this.enemies) { if (enemy.contactCooldown <= 0 && dist(enemy, this.player) < enemy.radius + this.player.radius) { const damaged = this.player.damage(enemy.damage); if (damaged) { enemy.contactCooldown = CONFIG.player.invulnerabilityMs / 1000; this.particles.push(new Particle(this.player.x, this.player.y - 20, '#fb7185', `-${enemy.damage} HP`)); } } for (const bullet of this.projectiles) if (dist(enemy, bullet) < enemy.radius + bullet.radius) { enemy.hp -= bullet.damage; bullet.life = 0; this.particles.push(new Particle(enemy.x, enemy.y, '#fecaca')); this.sound.play('hit'); } } for (const enemy of [...this.enemies]) if (enemy.hp <= 0) { this.score += enemy.score; this.xp.add(enemy.xp, this); if (Math.random() < CONFIG.drops.healChance) this.pickups.push(new Pickup(enemy.x, enemy.y)); this.enemies.splice(this.enemies.indexOf(enemy), 1); } for (const pickup of [...this.pickups]) if (dist(pickup, this.player) < pickup.radius + this.player.radius) { this.player.heal(pickup.amount); this.particles.push(new Particle(this.player.x, this.player.y - 20, '#86efac', `+${pickup.amount} HP`)); this.sound.play('heal'); this.pickups.splice(this.pickups.indexOf(pickup), 1); } }
  draw() { ctx.clearRect(0, 0, canvas.width, canvas.height); drawGrid(); this.pickups.forEach(p => p.draw()); this.projectiles.forEach(p => p.draw()); this.enemies.forEach(e => e.draw()); this.player.draw(); this.particles.forEach(p => p.draw()); }
  end() { this.running = false; ui.hud.classList.add('hidden'); ui.finalScore.textContent = `Score: ${this.score}`; ui.finalTime.textContent = `Survival Time: ${formatTime(this.elapsed)}`; show(ui.gameOver); }
  loop(timestamp) { const time = timestamp / 1000; const dt = Math.min(0.033, time - (this.lastTime || time)); this.lastTime = time; if (this.running) this.update(dt, time); this.draw(); requestAnimationFrame(t => this.loop(t)); }
}

function wireButton(id, handler) { const button = document.getElementById(id); if (button) button.addEventListener('click', handler); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function formatTime(seconds) { const m = Math.floor(seconds / 60).toString().padStart(2, '0'); const s = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
function show(el) { hide(ui.mainMenu, ui.characterMenu, ui.gameOver); el.classList.add('active'); }
function hide(...els) { els.forEach(el => el.classList.remove('active')); }
function drawGrid() { ctx.strokeStyle = 'rgba(148,163,184,0.11)'; ctx.lineWidth = 1; for (let x = 0; x < canvas.width; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); } for (let y = 0; y < canvas.height; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); } }
function resizeCanvas() { const ratio = 16 / 9; const w = window.innerWidth; const h = window.innerHeight; canvas.width = w / h > ratio ? Math.floor(h * ratio) : w; canvas.height = w / h > ratio ? h : Math.floor(w / ratio); }

const game = new Game();
