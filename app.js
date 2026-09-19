/* Gold Tower Defence M — a small, expandable canvas TD engine. */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const ATTRIBUTES = {
    scissors: { label: 'SCISSORS', color: '#eb8f9a', beats: 'rock' },
    rock: { label: 'ROCK', color: '#e2b86a', beats: 'paper' },
    paper: { label: 'PAPER', color: '#7cc9ed', beats: 'scissors' }
  };
  const ATTRIBUTE_ICONS = { scissors: '✂', rock: '◆', paper: '▱' };
  const RARITY = { common: '#a7b4b4', rare: '#72d5b8', epic: '#a78be9', legendary: '#e9bd63', mythic: '#f1a3dc' };

  const TOWERS = {
    thorn: { name: 'Thorn', symbol: '♧', attr: 'scissors', rarity: 'common', color: '#79c697', glow: '#5ca77d', cost: 55, range: 140, rate: .58, damage: 22, role: 'SINGLE', description: 'Reliable single-target bolts that punish armored foes.', attack: 'bolt' },
    ice: { name: 'Ice Arrow', symbol: '❄', attr: 'paper', rarity: 'rare', color: '#8ed7f0', glow: '#4e9fc1', cost: 80, range: 125, rate: .82, damage: 15, role: 'SLOW', description: 'Applies Frostbite and makes every enemy easier to catch.', attack: 'ice', slow: .44 },
    assassin: { name: 'Assassin', symbol: '◈', attr: 'scissors', rarity: 'epic', color: '#df96c9', glow: '#95588f', cost: 105, range: 155, rate: .95, damage: 48, role: 'CRIT', description: 'Strikes weakened targets for devastating critical damage.', attack: 'dagger', crit: 2.2 },
    shuriken: { name: 'Shuriken', symbol: '✣', attr: 'paper', rarity: 'rare', color: '#b7d2e8', glow: '#6f97c4', cost: 95, range: 165, rate: .75, damage: 18, role: 'MULTI', description: 'Splits each throw between three nearby enemies.', attack: 'shuriken', multi: 3 },
    magic: { name: 'Magic', symbol: '✧', attr: 'paper', rarity: 'epic', color: '#c99bfb', glow: '#8157bd', cost: 135, range: 145, rate: 1.1, damage: 54, role: 'SPLASH', description: 'Unstable arcana bursts on impact and hits a whole pack.', attack: 'orb', splash: 63 },
    lightning: { name: 'Lightning', symbol: 'ϟ', attr: 'rock', rarity: 'legendary', color: '#f7d47c', glow: '#bf8e32', cost: 170, range: 180, rate: 1.35, damage: 72, role: 'CHAIN', description: 'Jumps through enemies with the Paper attribute.', attack: 'bolt', chain: 3 },
    nun: { name: 'Nun', symbol: '✚', attr: 'paper', rarity: 'rare', color: '#d5e9ed', glow: '#81b4c5', cost: 90, range: 125, rate: 3.2, damage: 0, role: 'SUPPORT', description: 'Heals the vanguard and increases nearby tower attack speed.', attack: 'support', aura: 1.16 },
    cannon: { name: 'Cannon', symbol: '●', attr: 'rock', rarity: 'epic', color: '#e8a878', glow: '#ae6341', cost: 145, range: 152, rate: 1.65, damage: 110, role: 'AOE', description: 'Slow shells create a shockwave with heavy area damage.', attack: 'cannon', splash: 74 },
    wolf: { name: 'Wolf', symbol: '⌁', attr: 'scissors', rarity: 'rare', color: '#e2bc8b', glow: '#a77b50', cost: 125, range: 115, rate: .48, damage: 16, role: 'RAPID', description: 'A rapid hunter that tears through swarms and runners.', attack: 'wolf' },
    blossom: { name: 'Blossom', symbol: '✿', attr: 'rock', rarity: 'legendary', color: '#e999b4', glow: '#ae567d', cost: 190, range: 150, rate: 2.4, damage: 38, role: 'BLOOM', description: 'Blooms a field that weakens enemies and empowers allies.', attack: 'bloom', aura: 1.1 }
  };

  const HEROES = {
    solara: { name: 'Solara', title: 'Dawnkeeper', rarity: 'mythic', symbol: '✦', color: '#f4cf7a', attr: 'paper', description: 'A radiant commander whose sunlance pierces the front line.', hp: 900, damage: 62, range: 190, rate: .68, ability: 'SUNFALL', abilityText: 'Call down a solar flare that blinds a whole wave.' },
    kael: { name: 'Kael', title: 'Riftblade', rarity: 'legendary', symbol: '⚔', color: '#e797a4', attr: 'scissors', description: 'An oathless duelist who gains power from wounded enemies.', hp: 1060, damage: 80, range: 135, rate: .55, ability: 'PHANTOM STEP', abilityText: 'Dash to the furthest enemy and leave a bleeding mark.' },
    brakka: { name: 'Brakka', title: 'Stoneheart', rarity: 'legendary', symbol: '◆', color: '#d6ac6d', attr: 'rock', description: 'The immovable shield of the border clans.', hp: 1600, damage: 40, range: 120, rate: .9, ability: 'RALLY WALL', abilityText: 'Grants the citadel a temporary barrier and taunts elites.' },
    lyra: { name: 'Lyra', title: 'Frostcaller', rarity: 'epic', symbol: '❄', color: '#8ed7f0', attr: 'paper', description: 'A young seer who turns momentum into stillness.', hp: 820, damage: 45, range: 175, rate: .9, ability: 'WHITEOUT', abilityText: 'Freezes all enemies in a cone for 4 seconds.' }
  };

  const ENEMY_TYPES = {
    crawler: { name: 'Moss Crawler', hp: 85, speed: 39, reward: 9, attr: 'rock', color: '#75bf85', size: 12 },
    runner: { name: 'Rift Runner', hp: 56, speed: 72, reward: 11, attr: 'scissors', color: '#e28a9d', size: 10 },
    flyer: { name: 'Gloom Bat', hp: 72, speed: 60, reward: 13, attr: 'paper', color: '#b48fe1', size: 11, air: true },
    armored: { name: 'Iron Husk', hp: 265, speed: 28, reward: 25, attr: 'paper', color: '#b6a170', size: 16, armor: .25 },
    healer: { name: 'Bloom Shaman', hp: 145, speed: 33, reward: 30, attr: 'rock', color: '#78d0b6', size: 13, healer: true },
    splitter: { name: 'Sporeback', hp: 230, speed: 31, reward: 26, attr: 'scissors', color: '#d49672', size: 17, splitter: true },
    assassin: { name: 'Shade Stalker', hp: 125, speed: 50, reward: 32, attr: 'scissors', color: '#c276b2', size: 13, stealth: true },
    boss: { name: 'MORRIGAN, ROOT OF NIGHT', hp: 1980, speed: 23, reward: 240, attr: 'rock', color: '#cf6684', size: 32, boss: true, armor: .16 }
  };

  const REGIONS = [
    { name: 'Verdant Rift', short: 'RIFT', palette: ['#1d3e3b', '#5da67e'] },
    { name: 'Ashen March', short: 'ASH', palette: ['#42302c', '#ca8562'] },
    { name: 'Moonlit Fen', short: 'FEN', palette: ['#263252', '#8d9dd7'] },
    { name: 'Sunken Archive', short: 'ARCHIVE', palette: ['#3d3024', '#dbb16a'] },
    { name: 'Stormcrag', short: 'CRAG', palette: ['#263746', '#77b4d0'] },
    { name: 'Glass Wastes', short: 'WASTES', palette: ['#443442', '#e39da7'] },
    { name: 'Hollow Crown', short: 'CROWN', palette: ['#33283e', '#b881d6'] },
    { name: 'Frostveil', short: 'FROST', palette: ['#263c48', '#a7d7dc'] },
    { name: 'Starfall', short: 'STAR', palette: ['#252b50', '#a0a5e6'] },
    { name: 'Golden Gate', short: 'GATE', palette: ['#3d3321', '#e6be69'] }
  ];
  const STAGE_NAMES = ['The Mossbound Gate', 'Lanterns in the Deep', 'A Thorn in the Sky', 'The Quiet Swarm', 'Root of Night'];
  const BASE_PATH = [
    { x: -40, y: 112 }, { x: 175, y: 112 }, { x: 175, y: 246 }, { x: 404, y: 246 },
    { x: 404, y: 94 }, { x: 682, y: 94 }, { x: 682, y: 321 }, { x: 935, y: 321 },
    { x: 935, y: 492 }, { x: 1140, y: 492 }
  ];
  const PAD_POSITIONS = [
    { x: 83, y: 218 }, { x: 82, y: 372 }, { x: 258, y: 174 }, { x: 266, y: 338 }, { x: 330, y: 405 },
    { x: 510, y: 175 }, { x: 540, y: 370 }, { x: 730, y: 189 }, { x: 780, y: 405 }, { x: 1018, y: 248 }, { x: 1012, y: 402 }
  ];

  function getStage(number) {
    const n = clamp(Number(number) || 1, 1, 200);
    const regionIndex = Math.floor((n - 1) / 20);
    const stageInRegion = ((n - 1) % 20) + 1;
    const region = REGIONS[regionIndex];
    return {
      number: n,
      regionIndex,
      region,
      name: stageInRegion === 20 ? `${region.name} — The Warden's Throne` : `${STAGE_NAMES[(stageInRegion - 1) % STAGE_NAMES.length]} ${stageInRegion > 5 ? 'II' : ''}`.trim(),
      waves: 8,
      boss: stageInRegion % 5 === 0 || stageInRegion === 1,
      difficulty: 1 + Math.floor((n - 1) / 10) * .17 + ((stageInRegion - 1) % 5) * .04,
      palette: region.palette
    };
  }

  const DEFAULT_STATE = {
    gold: 420, diamond: 320, ruby: 8, magicStone: 18, mileage: 42,
    currentStage: 1, clearedStages: [], selectedHero: 'solara', ownedHeroes: ['solara', 'kael', 'brakka', 'lyra'],
    ownedTowers: ['thorn', 'ice', 'assassin', 'shuriken', 'magic', 'lightning', 'nun', 'cannon', 'wolf', 'blossom'],
    towerLevels: {}, xp: 480, level: 6, streak: 3, freeSummon: true,
    missions: { wave: 2, boss: 0, exploit: 7 }, stats: { bosses: 0, wins: 0, losses: 0 }, settings: { speed: 1 }
  };
  let state = structuredClone(DEFAULT_STATE);
  let battle = null;
  let rafId = 0;
  let lastFrame = 0;
  let toastTimer = 0;
  let bannerTimer = 0;
  let activeRegion = 0;
  let collectionTab = 'heroes';
  let selectedResultStage = 1;
  let idbPromise = null;

  function hydrate(raw) {
    if (!raw) return;
    state = { ...structuredClone(DEFAULT_STATE), ...raw,
      missions: { ...DEFAULT_STATE.missions, ...(raw.missions || {}) },
      stats: { ...DEFAULT_STATE.stats, ...(raw.stats || {}) },
      settings: { ...DEFAULT_STATE.settings, ...(raw.settings || {}) }
    };
  }

  function openDB() {
    if (idbPromise || !('indexedDB' in window)) return idbPromise;
    idbPromise = new Promise((resolve) => {
      const request = indexedDB.open('gold-tower-defence-m', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('save');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return idbPromise;
  }
  async function loadGame() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem('gold-tower-defence-m-save') || 'null'); } catch (_) { /* backup is optional */ }
    const db = await openDB();
    if (db) {
      try {
        const result = await new Promise(resolve => { const req = db.transaction('save').objectStore('save').get('player'); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); });
        if (result && (!raw || (result.savedAt || 0) > (raw.savedAt || 0))) raw = result;
      } catch (_) { /* use localStorage */ }
    }
    hydrate(raw);
  }
  function saveGame() {
    const payload = { ...state, savedAt: Date.now() };
    try { localStorage.setItem('gold-tower-defence-m-save', JSON.stringify(payload)); } catch (_) { /* storage can be full in private mode */ }
    openDB()?.then(db => { if (db) { try { db.transaction('save', 'readwrite').objectStore('save').put(payload, 'player'); } catch (_) {} } });
  }

  function showToast(message, tone = 'normal') {
    const el = $('#toast');
    el.textContent = message;
    el.className = `toast show ${tone}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 2600);
  }
  function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
  function formatNumber(n) { return Math.floor(n).toLocaleString('en-US'); }
  function showView(name) {
    if (battle) return;
    $$('.view').forEach(view => view.classList.toggle('active', view.dataset.view === name));
    $$('[data-nav]').forEach(btn => btn.classList.toggle('active', btn.dataset.nav === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'lobby') renderLobby();
    if (name === 'campaign') renderCampaign();
    if (name === 'collection') renderCollection();
  }

  function renderResources() {
    setText('gold-value', formatNumber(state.gold)); setText('diamond-value', formatNumber(state.diamond)); setText('ruby-value', formatNumber(state.ruby));
    setText('campaign-progress', `${Math.round(state.clearedStages.length / 200 * 100)}%`);
    setText('player-level', `LV. ${state.level.toString().padStart(2, '0')}`); setText('boss-count', state.stats.bosses.toString().padStart(2, '0'));
    setText('next-stage-label', `STAGE ${String(state.currentStage).padStart(2, '0')}`); setText('map-cleared', state.clearedStages.length);
  }
  function renderLobby() {
    renderResources();
    setText('streak-days', state.streak);
    const missionData = [
      ['⌁', 'Send 3 waves into the rift', Math.min(state.missions.wave, 3), 3, 'WAVES'],
      ['ϟ', 'Exploit an attribute weakness', Math.min(state.missions.exploit, 10), 10, 'WEAKNESS'],
      ['♜', 'Defeat an elite enemy', Math.min(state.missions.boss, 1), 1, 'ELITE']
    ];
    $('#mission-list').innerHTML = missionData.map(([icon, name, current, total, unit]) => `<div class="mission"><span class="mission-icon">${icon}</span><div><b>${name}</b><div class="mission-progress"><i style="width:${current / total * 100}%"></i></div></div><span>${current} / ${total} ${unit}</span></div>`).join('');
  }
  function renderCampaign() {
    renderResources();
    $('#region-tabs').innerHTML = REGIONS.map((region, i) => `<button class="${activeRegion === i ? 'active' : ''}" data-region="${i}">${region.short}<span>${i * 20 + 1}—${i * 20 + 20}</span></button>`).join('');
    const start = activeRegion * 20 + 1;
    const stageHTML = [];
    for (let i = 0; i < 20; i++) {
      const number = start + i; const cleared = state.clearedStages.includes(number); const locked = number > state.currentStage; const current = number === state.currentStage;
      const boss = number % 5 === 0 || number === 1;
      stageHTML.push(`<button class="stage-node ${cleared ? 'cleared' : ''} ${locked ? 'locked' : ''} ${current ? 'current' : ''} ${boss ? 'boss' : ''}" data-stage="${number}" ${locked ? 'disabled' : ''}><b>${String(i + 1).padStart(2, '0')}</b><small>${boss ? 'BOSS' : cleared ? 'CLEAR' : 'STAGE'}</small></button>`);
    }
    $('#stage-list').innerHTML = stageHTML.join('');
    $('#stage-list').style.setProperty('--region-main', REGIONS[activeRegion].palette[1]);
  }
  function renderCollection() {
    const grid = $('#collection-grid');
    if (collectionTab === 'heroes') {
      grid.innerHTML = Object.entries(HEROES).map(([id, hero]) => `<article class="codex-card" style="--unit-color:${hero.color};--unit-glow:${hero.color}55;--unit-dark:#1d2636"><div class="codex-art"><span class="rank">${hero.rarity.toUpperCase()} · ${ATTRIBUTES[hero.attr].label}</span><span class="codex-symbol">${hero.symbol}</span></div><h3>${hero.name}</h3><p>${hero.title} · ${hero.ability}</p><div class="codex-meta"><b>LV. ${id === state.selectedHero ? '06' : '01'}</b><span>${state.ownedHeroes.includes(id) ? 'OWNED' : 'LOCKED'}</span><div class="power-bars"><i></i><i></i><i></i><i class="off"></i><i class="off"></i></div></div></article>`).join('');
    } else if (collectionTab === 'towers') {
      grid.innerHTML = Object.entries(TOWERS).map(([id, tower]) => `<article class="codex-card" style="--unit-color:${tower.color};--unit-glow:${tower.glow}88;--unit-dark:#14242c"><div class="codex-art"><span class="rank">${tower.rarity.toUpperCase()} · ${ATTRIBUTES[tower.attr].label}</span><span class="codex-symbol">${tower.symbol}</span></div><h3>${tower.name}</h3><p>${tower.role} · ${tower.description}</p><div class="codex-meta"><b>LV. ${state.towerLevels[id] || 1}</b><span>${tower.cost} GOLD</span><div class="power-bars"><i></i><i></i><i class="off"></i><i class="off"></i><i class="off"></i></div></div></article>`).join('');
    } else {
      const relics = [['Sunroot Sigil', 'Start each wave with +10 mana.', '✧', '#e9bd63'], ['Glasswing Lens', 'Flying enemies take +12% damage.', '◇', '#8ed7f0'], ['Oath of Three', 'Every attribute advantage grants 5 gold.', '∞', '#c99bfb'], ['Rift Compass', 'The first elite appears 4s later.', '⌖', '#7bc8a1']];
      grid.innerHTML = relics.map(([name, desc, symbol, color]) => `<article class="codex-card" style="--unit-color:${color};--unit-glow:${color}66;--unit-dark:#19222e"><div class="codex-art"><span class="rank">RELIC · EQUIPPED</span><span class="codex-symbol">${symbol}</span></div><h3>${name}</h3><p>${desc}</p><div class="codex-meta"><b>RELIC</b><span>ACTIVE</span></div></article>`).join('');
    }
  }

  function initNavigation() {
    document.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-nav]'); if (nav) { showView(nav.dataset.nav); return; }
      const actionEl = event.target.closest('[data-action]'); if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === 'go-lobby') showView('lobby');
      else if (action === 'play-next') startBattle(state.currentStage);
      else if (action === 'open-campaign' || action === 'result-map') {
        closeResult();
        if (action === 'result-map') {
          battle = null;
          $('#battle-screen').classList.remove('open');
          $('#battle-screen').setAttribute('aria-hidden', 'true');
        }
        showView('campaign');
      }
      else if (action === 'open-collection') showView('collection');
      else if (action === 'open-challenges') showView('challenges');
      else if (action === 'open-gacha') $('#gacha-modal').hidden = false;
      else if (action === 'close-gacha') $('#gacha-modal').hidden = true;
      else if (action === 'summon') doSummon();
      else if (action === 'start-proof') startBattle(Math.max(1, Math.min(state.currentStage, 7)), { proof: true });
      else if (action === 'start-endless') startBattle(state.currentStage, { endless: true });
      else if (action === 'leave-battle') leaveBattle();
      else if (action === 'start-wave') startWave();
      else if (action === 'result-next') { const next = selectedResultStage + 1; closeResult(); startBattle(Math.min(200, next)); }
      else if (action === 'clear-log') { if (battle) $('#battle-log').innerHTML = ''; }
      else if (action === 'profile') showToast('Warden profile · level 6 · 42 mileage');
    });
    document.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-region]'); if (tab) { activeRegion = Number(tab.dataset.region); renderCampaign(); return; }
      const stage = event.target.closest('[data-stage]'); if (stage && !stage.disabled) startBattle(Number(stage.dataset.stage));
      const ctab = event.target.closest('[data-collection-tab]'); if (ctab) { collectionTab = ctab.dataset.collectionTab; $$('[data-collection-tab]').forEach(b => b.classList.toggle('active', b === ctab)); renderCollection(); }
      const ability = event.target.closest('[data-ability]'); if (ability) useAbility(ability.dataset.ability);
    });
  }

  function doSummon() {
    if (!state.freeSummon && state.diamond < 120) { showToast('Not enough diamonds for a summon.', 'warn'); return; }
    const wasFree = state.freeSummon;
    state.freeSummon = false;
    if (!wasFree) state.diamond -= 120;
    const newTower = pick(['thorn', 'ice', 'assassin', 'shuriken', 'magic', 'cannon', 'wolf']);
    state.ownedTowers = [...new Set([...state.ownedTowers, newTower])]; state.mileage += 1; saveGame(); renderResources();
    $('#gacha-modal').hidden = true;
    showToast(`SUMMONED · ${TOWERS[newTower].name} joins the codex`, 'success');
  }

  function setupCanvas() {
    const canvas = $('#battle-canvas');
    canvas.addEventListener('pointerdown', (event) => {
      if (!battle) return;
      const rect = canvas.getBoundingClientRect();
      const point = { x: (event.clientX - rect.left) / rect.width * 1100, y: (event.clientY - rect.top) / rect.height * 620 };
      battle.lastAim = point;
      const towerIndex = battle.towers.findIndex(t => distance(t, point) < 27);
      if (towerIndex >= 0) { battle.selectedTower = towerIndex; battle.selectedBuild = null; renderTowerTray(); renderSelectedPanel(); $('#battle-side').classList.add('open'); return; }
      if (battle.selectedBuild) {
        const padIndex = battle.pads.findIndex(p => distance(p, point) < 35);
        if (padIndex >= 0) buildTower(padIndex, battle.selectedBuild);
        else showBattleToast('Choose a glowing build pad.');
        return;
      }
      if (point.x > 920 && point.y < 90) { $('#battle-side').classList.toggle('open'); }
      battle.hero.target = { x: clamp(point.x, 40, 840), y: clamp(point.y, 45, 565) };
      addBattleLog(`Hero moved to new position.`);
      spawnParticles(battle.hero.x, battle.hero.y, '#f4cf7a', 7);
    });
    window.addEventListener('resize', resizeCanvas);
  }
  function resizeCanvas() {
    if (!battle) return;
    const canvas = $('#battle-canvas'); const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr)); canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function startBattle(stageNumber, mode = {}) {
    $('#gacha-modal').hidden = true; closeResult();
    const stage = getStage(stageNumber);
    battle = {
      stage, mode, active: true, running: false, wave: 0, totalWaves: mode.endless ? Infinity : stage.waves, waveRunning: false, waveClock: 0, spawnClock: 0, spawnQueue: [],
      enemies: [], projectiles: [], particles: [], floaters: [], towers: [], pads: PAD_POSITIONS.map((p, i) => ({ ...p, id: i, occupied: false })),
      gold: 260 + Math.floor(stageNumber * 3), mana: 100, lives: mode.proof ? 1 : 20, selectedBuild: null, selectedTower: -1, lastAim: { x: 600, y: 300 }, time: 0,
      hero: { ...HEROES[state.selectedHero], id: state.selectedHero, x: 270, y: 310, target: { x: 270, y: 310 }, cooldown: .25, abilityCooldown: 0, buff: 0, hp: HEROES[state.selectedHero].hp },
      path: BASE_PATH.map(p => ({ ...p })), pathLengths: [], pathTotal: 0, speed: state.settings.speed || 1, ended: false, proof: !!mode.proof
    };
    let total = 0;
    for (let i = 1; i < battle.path.length; i++) { const len = distance(battle.path[i - 1], battle.path[i]); battle.pathLengths.push(len); total += len; }
    battle.pathTotal = total;
    $('#battle-screen').classList.add('open'); $('#battle-screen').setAttribute('aria-hidden', 'false');
    $('#battle-stage-title').textContent = stage.name; $('#battle-region').textContent = `REGION ${String(stage.regionIndex + 1).padStart(2, '0')} · ${stage.region.name.toUpperCase()}`;
    $('#battle-gold').textContent = battle.gold; $('#battle-mana').textContent = battle.mana; $('#battle-lives').textContent = battle.lives;
    $('#wave-count').textContent = `0 / ${mode.endless ? '∞' : battle.totalWaves}`; $('#enemies-left').textContent = 'Ready when you are.'; $('#wave-type').textContent = mode.proof ? 'PROOF RULESET' : stage.boss ? 'BOSS FRONTIER' : 'SCOUTING PARTY';
    $('#battle-log').innerHTML = ''; $('#selected-panel').innerHTML = `<div class="empty-selection"><span>⌖</span><b>SELECT A TOWER</b><small>Build a defense or tap a tower to inspect it.</small></div>`;
    $('#wave-button').classList.remove('running'); $('#wave-button').innerHTML = '<span>▶</span><b>START WAVE</b><small>prepare your line</small>';
    // A free scout makes the first decision readable without playing itself.
    buildTower(0, 'thorn', true);
    renderTowerTray(); renderBattleAbilities(); resizeCanvas(); addBattleLog(`Stage ${String(stage.number).padStart(2, '0')} · ${stage.name} entered.`); addBattleLog(`Attribute wheel online: ${ATTRIBUTE_ICONS.scissors} beats ${ATTRIBUTE_ICONS.rock}, ${ATTRIBUTE_ICONS.rock} beats ${ATTRIBUTE_ICONS.paper}.`);
    if (!rafId) { lastFrame = performance.now(); rafId = requestAnimationFrame(gameLoop); }
    showBattleToast(mode.proof ? 'PROOF RULESET · ONE LIFE' : 'Build your line, Warden.');
  }
  function leaveBattle() {
    if (!battle) return;
    battle = null; $('#battle-screen').classList.remove('open'); $('#battle-screen').setAttribute('aria-hidden', 'true'); showView('lobby');
  }
  function closeResult() { $('#result-modal').hidden = true; }

  function renderBattleAbilities() {
    $$('.ability-button').forEach(button => { button.classList.remove('disabled'); button.querySelector('i').style.height = '0%'; });
  }
  function renderTowerTray() {
    if (!battle) return;
    const tray = $('#tower-tray-cards');
    tray.innerHTML = state.ownedTowers.map(id => {
      const tower = TOWERS[id]; const level = state.towerLevels[id] || 1; const affordable = battle.gold >= tower.cost;
      return `<button class="tower-card ${battle.selectedBuild === id ? 'selected' : ''}" data-build-tower="${id}" style="--tower-color:${tower.color};--tower-glow:${tower.glow};opacity:${affordable ? 1 : .5}"><span class="card-symbol">${tower.symbol}</span><b>${tower.name}</b><small>${tower.role} · Lv${level}</small><span class="tower-cost">${tower.cost}</span></button>`;
    }).join('');
    tray.querySelectorAll('[data-build-tower]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.buildTower;
      if (battle.gold < TOWERS[id].cost) { showBattleToast('Not enough gold for this tower.'); return; }
      battle.selectedBuild = battle.selectedBuild === id ? null : id; battle.selectedTower = -1; renderTowerTray(); renderSelectedPanel();
      showBattleToast(battle.selectedBuild ? `Deploy ${TOWERS[id].name} on a glowing pad.` : 'Build order cancelled.');
    }));
  }
  function buildTower(padIndex, id, free = false) {
    if (!battle || battle.pads[padIndex]?.occupied) { if (!free) showBattleToast('That build pad is occupied.'); return; }
    const data = TOWERS[id]; if (!free && battle.gold < data.cost) { showBattleToast('Not enough gold.'); return; }
    if (!free) battle.gold -= data.cost;
    const pad = battle.pads[padIndex]; pad.occupied = true;
    battle.towers.push({ ...pad, towerId: id, level: state.towerLevels[id] || 1, cooldown: .2, kills: 0, buffed: 0 });
    battle.selectedBuild = null; battle.selectedTower = battle.towers.length - 1; setText('battle-gold', battle.gold); renderTowerTray(); renderSelectedPanel();
    spawnParticles(pad.x, pad.y, data.color, 15); addBattleLog(`${data.name} deployed on pad ${padIndex + 1}.`);
  }
  function upgradeSelectedTower() {
    if (!battle || battle.selectedTower < 0) return;
    const tower = battle.towers[battle.selectedTower]; const data = TOWERS[tower.towerId]; const cost = Math.floor(data.cost * (.72 + tower.level * .48));
    if (tower.level >= 5) { showBattleToast('This tower has reached max tier.'); return; }
    if (battle.gold < cost) { showBattleToast(`Need ${cost} gold for the next tier.`); return; }
    battle.gold -= cost; tower.level++; setText('battle-gold', battle.gold); renderTowerTray(); renderSelectedPanel();
    addBattleLog(`${data.name} upgraded to Tier ${tower.level}.`); spawnParticles(tower.x, tower.y, '#f4d17e', 20); showBattleToast(`${data.name} · TIER ${tower.level}`);
  }
  function sellSelectedTower() {
    if (!battle || battle.selectedTower < 0) return;
    const tower = battle.towers[battle.selectedTower]; const data = TOWERS[tower.towerId]; const refund = Math.floor(data.cost * (.46 + tower.level * .12));
    battle.gold += refund; battle.pads[tower.id].occupied = false; battle.towers.splice(battle.selectedTower, 1); battle.selectedTower = -1; setText('battle-gold', battle.gold); renderTowerTray(); renderSelectedPanel(); addBattleLog(`${data.name} salvaged for ${refund} gold.`);
  }
  function renderSelectedPanel() {
    if (!battle) return;
    const panel = $('#selected-panel');
    if (battle.selectedTower < 0) { panel.innerHTML = `<div class="empty-selection"><span>${battle.selectedBuild ? TOWERS[battle.selectedBuild].symbol : '⌖'}</span><b>${battle.selectedBuild ? 'DEPLOYMENT MODE' : 'SELECT A TOWER'}</b><small>${battle.selectedBuild ? 'Tap an open rune on the field.' : 'Build a defense or tap a tower to inspect it.'}</small></div>`; return; }
    const tower = battle.towers[battle.selectedTower]; const data = TOWERS[tower.towerId]; const cost = Math.floor(data.cost * (.72 + tower.level * .48));
    panel.innerHTML = `<div class="tower-inspect" style="--tower-color:${data.color}"><div class="inspect-symbol">${data.symbol}</div><div><h3>${data.name}</h3><small>${data.role} · TIER ${tower.level}</small></div><p class="inspect-description">${data.description}</p><div class="inspect-stats"><div class="inspect-stat"><b>${Math.round(data.damage * (1 + (tower.level - 1) * .48)) || 'AURA'}</b>POWER</div><div class="inspect-stat"><b>${Math.round(data.range + tower.level * 5)}</b>RANGE</div></div><div class="inspect-actions"><button class="button primary" data-upgrade-tower>UPGRADE · ${tower.level >= 5 ? 'MAX' : cost}</button><button class="button ghost" data-sell-tower>SELL</button></div></div>`;
    panel.querySelector('[data-upgrade-tower]').addEventListener('click', upgradeSelectedTower); panel.querySelector('[data-sell-tower]').addEventListener('click', sellSelectedTower);
  }

  function wavePlan(wave) {
    if (wave >= 8) return [{ type: 'boss', count: 1, gap: .7 }, { type: 'healer', count: 2, gap: 1.15 }, { type: 'runner', count: 5, gap: .48 }];
    const sets = [
      [{ type: 'crawler', count: 8 }, { type: 'runner', count: 4 }],
      [{ type: 'crawler', count: 8 }, { type: 'flyer', count: 4 }],
      [{ type: 'runner', count: 8 }, { type: 'armored', count: 2 }],
      [{ type: 'crawler', count: 8 }, { type: 'healer', count: 3 }, { type: 'runner', count: 4 }],
      [{ type: 'armored', count: 4 }, { type: 'flyer', count: 5 }],
      [{ type: 'splitter', count: 3 }, { type: 'runner', count: 8 }],
      [{ type: 'assassin', count: 5 }, { type: 'healer', count: 2 }, { type: 'crawler', count: 7 }]
    ];
    const scale = 1 + Math.floor((battle?.stage.number || 1) / 20) * .09;
    return sets[(wave - 1) % sets.length].map(entry => ({ ...entry, count: Math.ceil(entry.count * scale) }));
  }
  function startWave() {
    if (!battle || battle.ended) return;
    if (battle.waveRunning) { showBattleToast('The wave is already in the field.'); return; }
    battle.wave++; if (battle.wave > battle.totalWaves && battle.totalWaves !== Infinity) return;
    battle.running = true; battle.waveRunning = true; battle.spawnClock = 0;
    const plan = wavePlan(battle.wave); battle.spawnQueue = [];
    plan.forEach(pack => { for (let i = 0; i < pack.count; i++) battle.spawnQueue.push({ type: pack.type, delay: i * (pack.gap || .68) + (battle.spawnQueue.length ? .15 : 0) }); });
    $('#wave-count').textContent = `${battle.wave} / ${battle.totalWaves === Infinity ? '∞' : battle.totalWaves}`;
    $('#wave-type').textContent = battle.wave >= 8 ? 'ELITE BOSS · ROOT OF NIGHT' : plan.length > 1 ? 'MIXED FORMATION' : 'INCOMING';
    $('#wave-button').classList.add('running'); $('#wave-button').innerHTML = '<span>◈</span><b>WAVE ACTIVE</b><small>hold the line</small>';
    showWaveBanner(battle.wave >= 8 ? 'BOSS AWAKENS' : `WAVE ${String(battle.wave).padStart(2, '0')}`);
    addBattleLog(`Wave ${battle.wave} deployed · ${plan.map(p => `${p.count} ${ENEMY_TYPES[p.type].name}`).join(', ')}.`);
    state.missions.wave = Math.min(3, state.missions.wave + 1); saveGame();
  }
  function showWaveBanner(title) {
    const banner = $('#wave-banner'); $('#wave-banner-title').textContent = title; banner.classList.add('show'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => banner.classList.remove('show'), 1900);
  }
  function addBattleLog(message) {
    const log = $('#battle-log'); if (!log) return; const time = battle ? `${Math.floor(battle.time / 60).toString().padStart(2, '0')}:${Math.floor(battle.time % 60).toString().padStart(2, '0')}` : '00:00';
    log.insertAdjacentHTML('afterbegin', `<div class="log-entry"><b>${time}</b><span>${message}</span></div>`);
    while (log.children.length > 7) log.lastElementChild.remove();
  }
  function showBattleToast(message) { const el = $('#battle-toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); }

  function createEnemy(type) {
    const data = ENEMY_TYPES[type]; const scale = battle.stage.difficulty;
    const hp = Math.round(data.hp * scale * (battle.mode.endless ? 1 + Math.floor(battle.wave / 8) * .32 : 1));
    return { id: Math.random().toString(36).slice(2), type, ...data, hp, maxHp: hp, distance: 0, slow: 0, stun: 0, burn: 0, healClock: rand(1, 2), phase: 1, shield: data.boss ? 360 : 0, hitFlash: 0, dead: false, x: battle.path[0].x, y: battle.path[0].y };
  }
  function pointAtDistance(dist) {
    let remaining = dist;
    for (let i = 1; i < battle.path.length; i++) { const len = battle.pathLengths[i - 1]; if (remaining <= len) { const a = battle.path[i - 1], b = battle.path[i], t = remaining / len; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; } remaining -= len; }
    return { ...battle.path[battle.path.length - 1] };
  }
  function spawnEnemy(type) { const enemy = createEnemy(type); battle.enemies.push(enemy); spawnParticles(enemy.x, enemy.y, enemy.color, enemy.boss ? 25 : 5); }
  function getTarget(tower) {
    const data = TOWERS[tower.towerId]; let best = null; let bestDistance = -Infinity;
    for (const enemy of battle.enemies) { if (enemy.dead || distance(tower, enemy) > data.range + tower.level * 5) continue; if (enemy.distance > bestDistance) { bestDistance = enemy.distance; best = enemy; } }
    return best;
  }
  function getMultiplier(attackAttr, defenseAttr) {
    if (!attackAttr || !defenseAttr) return 1;
    if (ATTRIBUTES[attackAttr].beats === defenseAttr) return 1.45;
    if (ATTRIBUTES[defenseAttr].beats === attackAttr) return .72;
    return 1;
  }
  function fireTower(tower, target) {
    const data = TOWERS[tower.towerId]; const levelScale = 1 + (tower.level - 1) * .48; let damage = data.damage * levelScale;
    if (data.attack === 'assassin' && target.hp < target.maxHp * .45) damage *= data.crit;
    if (data.attack === 'support') { supportPulse(tower); return; }
    if (data.attack === 'bloom') { bloomPulse(tower); return; }
    const shot = { x: tower.x, y: tower.y, target, tx: target.x, ty: target.y, damage, type: data.attack, color: data.color, progress: 0, splash: data.splash || 0, slow: data.slow || 0, chain: data.chain || 0, source: tower };
    battle.projectiles.push(shot); spawnParticles(tower.x, tower.y, data.color, 3);
    if (data.multi) {
      const nearby = battle.enemies.filter(e => !e.dead && e !== target && distance(target, e) < 105).sort((a, b) => b.distance - a.distance).slice(0, data.multi - 1);
      nearby.forEach(extra => battle.projectiles.push({ ...shot, target: extra, tx: extra.x, ty: extra.y, progress: .05, damage: damage * .62 }));
    }
  }
  function supportPulse(tower) {
    const data = TOWERS[tower.towerId]; const aura = data.aura * (1 + (tower.level - 1) * .06); battle.towers.forEach(other => { if (distance(tower, other) < data.range * 1.25) other.buffed = 1.5; });
    battle.hero.hp = clamp(battle.hero.hp + 80 * (1 + tower.level * .1), 0, battle.hero.hp + 120); spawnParticles(tower.x, tower.y, data.color, 14); addBattleLog(`Nun's hymn renews the line.`); // aura is read by attack cooldown below
    tower.lastAura = aura;
  }
  function bloomPulse(tower) {
    const data = TOWERS[tower.towerId]; battle.enemies.filter(e => !e.dead && distance(tower, e) < data.range).forEach(enemy => { enemy.slow = Math.max(enemy.slow, .22); enemy.hp -= data.damage * .25; });
    battle.towers.forEach(other => { if (distance(tower, other) < 130) other.buffed = 1.2; }); spawnParticles(tower.x, tower.y, data.color, 22);
  }
  function applyProjectile(shot) {
    const enemy = shot.target; if (!enemy || enemy.dead) return;
    const attackAttr = shot.source && shot.source.towerId ? TOWERS[shot.source.towerId].attr : battle.hero.attr;
    let damage = shot.damage * getMultiplier(attackAttr, enemy.attr);
    if (enemy.shield > 0) { const absorbed = Math.min(enemy.shield, damage); enemy.shield -= absorbed; damage -= absorbed; spawnFloater(enemy.x, enemy.y - 20, `SHIELD -${Math.round(absorbed)}`, '#9abbd1'); }
    if (damage > 0) {
      enemy.hp -= damage; enemy.hitFlash = .12;
      if (getMultiplier(attackAttr, enemy.attr) > 1) { spawnFloater(enemy.x, enemy.y - 17, `WEAK! +${Math.round(damage)}`, '#f8d98a'); state.missions.exploit = Math.min(10, state.missions.exploit + 1); }
      else spawnFloater(enemy.x, enemy.y - 16, `-${Math.round(damage)}`, shot.color);
    }
    if (shot.slow) enemy.slow = Math.max(enemy.slow, shot.slow);
    if (shot.type === 'cannon' || shot.type === 'orb') { battle.enemies.filter(e => !e.dead && e !== enemy && distance(e, enemy) < shot.splash).forEach(near => { near.hp -= shot.damage * .34; near.hitFlash = .1; }); spawnParticles(enemy.x, enemy.y, shot.color, 17); }
    else if (shot.type === 'bolt' || shot.type === 'lightning') spawnParticles(enemy.x, enemy.y, shot.color, 8);
    if (shot.chain) {
      const next = battle.enemies.filter(e => !e.dead && e !== enemy && distance(e, enemy) < 105).sort((a, b) => distance(a, enemy) - distance(b, enemy))[0];
      if (next) { next.hp -= damage * .48; spawnParticles(next.x, next.y, shot.color, 9); }
    }
    if (enemy.hp <= 0) killEnemy(enemy, shot.source);
  }
  function fireHero() {
    const hero = battle.hero; const target = battle.enemies.filter(e => !e.dead && distance(hero, e) < hero.range).sort((a, b) => b.distance - a.distance)[0]; if (!target) return;
    battle.projectiles.push({ x: hero.x, y: hero.y, target, tx: target.x, ty: target.y, damage: hero.damage * (hero.buff > 0 ? 1.35 : 1), type: 'hero', color: hero.color, progress: 0, splash: 0, slow: hero.attr === 'paper' ? .12 : 0, source: hero });
    spawnParticles(hero.x, hero.y, hero.color, 4);
  }
  function killEnemy(enemy, source) {
    if (enemy.dead) return; enemy.dead = true; battle.gold += enemy.reward; if (source && source.towerId) source.kills++;
    if (enemy.boss) { battle.missionBoss = true; addBattleLog('ROOT OF NIGHT has fallen. The rift trembles.'); }
    spawnParticles(enemy.x, enemy.y, enemy.color, enemy.boss ? 38 : 13); spawnFloater(enemy.x, enemy.y - 23, `+${enemy.reward}g`, '#e9bd63');
    if (enemy.splitter && battle.wave < 8) { for (let i = 0; i < 2; i++) { const child = createEnemy('runner'); child.distance = Math.max(0, enemy.distance - i * 8); battle.enemies.push(child); } addBattleLog('Sporeback splits into two Rift Runners.'); }
    setText('battle-gold', battle.gold);
  }

  function useAbility(name) {
    if (!battle || !battle.running || battle.ended) { showBattleToast('Start a wave before using an ability.'); return; }
    const costs = { meteor: 60, frost: 40, rally: 30 }; const cost = costs[name]; if (battle.mana < cost) { showBattleToast(`Need ${cost} mana.`); return; }
    battle.mana -= cost; setText('battle-mana', Math.floor(battle.mana)); const point = battle.lastAim || { x: 600, y: 300 };
    if (name === 'meteor') {
      battle.enemies.filter(e => !e.dead && distance(e, point) < 120).forEach(enemy => { enemy.hp -= 250; enemy.hitFlash = .2; if (enemy.hp <= 0) killEnemy(enemy, null); }); spawnParticles(point.x, point.y, '#f19c71', 55); spawnFloater(point.x, point.y - 50, 'METEOR', '#ffcf9c'); addBattleLog('Meteor ruptures the enemy formation.');
    } else if (name === 'frost') {
      battle.enemies.forEach(enemy => enemy.stun = Math.max(enemy.stun, 3.2)); spawnParticles(620, 285, '#7fc7f1', 44); addBattleLog('Frostbind freezes every enemy on the field.');
    } else {
      battle.hero.buff = 8; battle.towers.forEach(tower => tower.buffed = 8); spawnParticles(battle.hero.x, battle.hero.y, '#d4afee', 35); addBattleLog('Rally empowers heroes and towers for 8 seconds.');
    }
    showBattleToast(name === 'meteor' ? 'METEOR IMPACT' : name === 'frost' ? 'FROSTBIND · WAVE FROZEN' : 'RALLY · LINE EMPOWERED');
  }

  function gameLoop(now) {
    rafId = requestAnimationFrame(gameLoop); const dt = Math.min(.045, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
    if (battle) { updateBattle(dt * battle.speed); renderBattle(); }
  }
  function updateBattle(dt) {
    if (!battle || !battle.active) return; battle.time += dt;
    if (battle.running) {
      battle.mana = clamp(battle.mana + dt * .8, 0, 100); setText('battle-mana', Math.floor(battle.mana));
      if (battle.waveRunning) {
        battle.spawnClock += dt;
        if (battle.spawnQueue.length && battle.spawnClock >= battle.spawnQueue[0].delay) { spawnEnemy(battle.spawnQueue.shift().type); battle.spawnClock = 0; }
        if (!battle.spawnQueue.length && !battle.enemies.some(e => !e.dead)) { completeWave(); }
      }
      for (const enemy of battle.enemies) updateEnemy(enemy, dt);
      battle.enemies = battle.enemies.filter(enemy => !enemy.dead || enemy.fade > 0);
      updateTowers(dt); updateProjectiles(dt); updateHero(dt);
      if (battle.lives <= 0) endBattle(false);
      const live = battle.enemies.filter(e => !e.dead).length + battle.spawnQueue.length; setText('enemies-left', live ? `${live} hostiles in field` : battle.waveRunning ? 'Clearing the field…' : 'Ready when you are.');
      $('#wave-progress').style.width = `${clamp((1 - live / Math.max(1, battle.spawnQueue.length + battle.enemies.length + 1)) * 100, 0, 100)}%`;
    }
    updateParticles(dt); updateFloaters(dt);
  }
  function completeWave() {
    if (!battle.waveRunning) return; battle.waveRunning = false; battle.running = false; $('#wave-button').classList.remove('running');
    if (battle.wave >= battle.totalWaves && battle.totalWaves !== Infinity) { endBattle(true); return; }
    $('#wave-button').innerHTML = '<span>▶</span><b>NEXT WAVE</b><small>the rift stirs</small>'; addBattleLog(`Wave ${battle.wave} cleared. Choose your next line.`); showBattleToast(`WAVE ${battle.wave} CLEARED · SAVE OR PRESS NEXT`);
  }
  function updateEnemy(enemy, dt) {
    if (enemy.dead) { enemy.fade = (enemy.fade || .22) - dt; return; }
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt); enemy.stun = Math.max(0, enemy.stun - dt); enemy.slow = Math.max(0, enemy.slow - dt); enemy.healClock -= dt;
    if (enemy.healer && enemy.healClock <= 0) { enemy.healClock = 2.4; battle.enemies.filter(other => !other.dead && other !== enemy && distance(other, enemy) < 125).forEach(other => { other.hp = Math.min(other.maxHp, other.hp + 32); spawnFloater(other.x, other.y - 18, '+32', '#7bc8a1'); }); }
    if (enemy.boss) {
      const ratio = enemy.hp / enemy.maxHp;
      const newPhase = ratio < .32 ? 3 : ratio < .66 ? 2 : 1;
      if (newPhase !== enemy.phase) { enemy.phase = newPhase; enemy.speed += 7; enemy.shield = newPhase === 2 ? 440 : 0; showWaveBanner(newPhase === 2 ? 'MORRIGAN · THORNSHIELD' : 'MORRIGAN · ENRAGED'); addBattleLog(newPhase === 2 ? 'Morrigan grows a regenerative Thornshield.' : 'Morrigan enters an enraged phase.'); }
      if (enemy.phase === 2 && enemy.healClock <= 0) { enemy.healClock = 3.4; enemy.hp = Math.min(enemy.maxHp, enemy.hp + 80); enemy.shield = Math.max(enemy.shield, 120); }
    }
    if (enemy.stun > 0) return;
    const speed = enemy.speed * (enemy.slow ? 1 - enemy.slow : 1) * (enemy.phase === 3 ? 1.25 : 1);
    enemy.distance += speed * dt; const point = pointAtDistance(enemy.distance); enemy.x = point.x; enemy.y = point.y;
    if (enemy.distance >= battle.pathTotal) { enemy.dead = true; enemy.fade = 0; battle.lives -= enemy.boss ? 5 : 1; setText('battle-lives', battle.lives); spawnParticles(1000, 490, '#ed7876', 15); addBattleLog(`${enemy.boss ? 'The boss' : 'An enemy'} breached the citadel. ${battle.lives} lives remain.`); }
  }
  function updateTowers(dt) {
    battle.towers.forEach(tower => {
      const data = TOWERS[tower.towerId]; tower.cooldown -= dt; tower.buffed = Math.max(0, tower.buffed - dt);
      if (tower.cooldown <= 0) { const target = getTarget(tower); if (target) { fireTower(tower, target); tower.cooldown = data.rate / (tower.buffed > 0 ? 1.35 : 1); } }
    });
  }
  function updateProjectiles(dt) {
    battle.projectiles.forEach(shot => { if (!shot.target || shot.target.dead) { shot.progress = 2; return; } shot.progress += dt * (shot.type === 'cannon' ? 2.9 : 5.4); shot.x += (shot.target.x - shot.x) * clamp(dt * 12, 0, 1); shot.y += (shot.target.y - shot.y) * clamp(dt * 12, 0, 1); if (shot.progress >= 1) { applyProjectile(shot); shot.progress = 2; } });
    battle.projectiles = battle.projectiles.filter(shot => shot.progress < 2);
  }
  function updateHero(dt) {
    const hero = battle.hero; hero.buff = Math.max(0, hero.buff - dt); hero.cooldown -= dt; hero.abilityCooldown = Math.max(0, hero.abilityCooldown - dt);
    const d = distance(hero, hero.target); if (d > 2) { const step = Math.min(d, 78 * dt); hero.x += (hero.target.x - hero.x) / d * step; hero.y += (hero.target.y - hero.y) / d * step; }
    if (hero.cooldown <= 0 && battle.enemies.some(e => !e.dead && distance(hero, e) < hero.range)) { fireHero(); hero.cooldown = hero.rate / (hero.buff > 0 ? 1.25 : 1); }
  }
  function spawnParticles(x, y, color, count = 8) { if (!battle) return; for (let i = 0; i < count; i++) battle.particles.push({ x, y, vx: rand(-65, 65), vy: rand(-65, 65), life: rand(.25, .8), max: .8, size: rand(1.5, 4), color }); }
  function spawnFloater(x, y, text, color) { battle.floaters.push({ x, y, text, color, life: 1, max: 1 }); }
  function updateParticles(dt) { if (!battle) return; battle.particles.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 32 * dt; }); battle.particles = battle.particles.filter(p => p.life > 0); battle.floaters.forEach(f => { f.life -= dt; f.y -= 22 * dt; }); battle.floaters = battle.floaters.filter(f => f.life > 0); }

  function renderBattle() {
    if (!battle) return; const canvas = $('#battle-canvas'); const ctx = canvas.getContext('2d'); const rect = canvas.getBoundingClientRect(); const sx = rect.width / 1100, sy = rect.height / 620; ctx.setTransform(sx, 0, 0, sy, 0, 0); ctx.clearRect(0, 0, 1100, 620);
    drawBattleBackground(ctx); drawPath(ctx); drawPads(ctx); battle.towers.forEach(tower => drawTower(ctx, tower)); battle.enemies.forEach(enemy => drawEnemy(ctx, enemy)); battle.projectiles.forEach(projectile => drawProjectile(ctx, projectile)); drawHero(ctx); drawParticles(ctx); drawFloaters(ctx);
  }
  function drawBattleBackground(ctx) {
    const [dark, light] = battle.stage.palette; const gradient = ctx.createLinearGradient(0, 0, 0, 620); gradient.addColorStop(0, dark); gradient.addColorStop(.6, '#13262b'); gradient.addColorStop(1, '#0b171b'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1100, 620);
    ctx.fillStyle = 'rgba(199,231,202,.35)'; for (let i = 0; i < 38; i++) { const x = (i * 173 + 43) % 1100, y = (i * 79 + 26) % 300; ctx.globalAlpha = .13 + ((i * 7) % 8) / 40; ctx.fillRect(x, y, 1.5, 1.5); } ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(87,168,136,.1)'; for (let i = 0; i < 18; i++) { const x = i * 67 + 18; ctx.beginPath(); ctx.arc(x, 560 - (i % 3) * 22, 32 + i % 4 * 7, Math.PI, TAU); ctx.fill(); }
    ctx.fillStyle = light; ctx.globalAlpha = .08; ctx.beginPath(); ctx.arc(840, 75, 100, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(142,204,190,.07)'; ctx.lineWidth = 1; for (let x = 0; x < 1100; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 620); ctx.stroke(); } for (let y = 0; y < 620; y += 55) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1100, y); ctx.stroke(); }
  }
  function drawPath(ctx) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = (width, stroke, dash = []) => { ctx.beginPath(); ctx.moveTo(battle.path[0].x, battle.path[0].y); battle.path.slice(1).forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); };
    path(60, 'rgba(5,11,13,.72)'); path(43, '#25454a'); path(37, '#152d33'); path(2, 'rgba(123,209,184,.22)', [5, 13]);
    const base = battle.path[battle.path.length - 1]; ctx.fillStyle = '#111c22'; ctx.strokeStyle = '#e9bd63'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(base.x - 2, base.y, 30, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e9bd63'; ctx.font = '700 20px Barlow Condensed, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('◆', base.x - 2, base.y + 7); ctx.font = '700 8px Barlow Condensed, sans-serif'; ctx.fillText('CITADEL', base.x - 2, base.y + 47); ctx.textAlign = 'left';
  }
  function drawPads(ctx) {
    battle.pads.forEach(pad => { if (pad.occupied) return; const highlight = !!battle.selectedBuild; ctx.save(); ctx.translate(pad.x, pad.y); ctx.strokeStyle = highlight ? '#e9bd63' : 'rgba(127,194,175,.34)'; ctx.fillStyle = highlight ? 'rgba(233,189,99,.12)' : 'rgba(30,65,68,.58)'; ctx.lineWidth = highlight ? 2 : 1; ctx.beginPath(); ctx.arc(0, 0, 23, 0, TAU); ctx.fill(); ctx.stroke(); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = highlight ? '#e9bd63' : '#6b9790'; ctx.font = '700 17px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', 0, 6); ctx.restore(); });
  }
  function drawTower(ctx, tower) {
    const data = TOWERS[tower.towerId]; const selected = battle.selectedTower >= 0 && battle.towers[battle.selectedTower] === tower; ctx.save(); ctx.translate(tower.x, tower.y); ctx.shadowColor = data.glow; ctx.shadowBlur = selected ? 24 : 12; ctx.fillStyle = '#101b20'; ctx.strokeStyle = selected ? '#f7d57b' : data.color; ctx.lineWidth = selected ? 2 : 1.5; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = `${data.color}25`; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill(); ctx.fillStyle = data.color; ctx.font = `700 ${tower.towerId === 'cannon' ? 20 : 22}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(data.symbol, 0, 1); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#d8e5df'; ctx.font = '700 9px Barlow Condensed, sans-serif'; ctx.fillText(`T${tower.level}`, -10, 34); if (tower.buffed > 0) { ctx.strokeStyle = '#d4afee'; ctx.globalAlpha = .7; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU); ctx.stroke(); } ctx.restore();
  }
  function drawEnemy(ctx, enemy) {
    if (enemy.fade !== undefined && enemy.dead) ctx.globalAlpha = clamp(enemy.fade / .22, 0, 1); if (enemy.dead) { ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.strokeStyle = enemy.color; ctx.globalAlpha *= .6; ctx.beginPath(); ctx.arc(0, 0, enemy.size + 7, 0, TAU); ctx.stroke(); ctx.restore(); return; }
    ctx.save(); ctx.translate(enemy.x, enemy.y); if (enemy.air) ctx.translate(0, Math.sin(battle.time * 5 + enemy.distance) * 4); ctx.shadowColor = enemy.color; ctx.shadowBlur = enemy.boss ? 22 : 8; ctx.fillStyle = enemy.hitFlash > 0 ? '#fff7d1' : enemy.color; ctx.strokeStyle = enemy.boss ? '#f4bc82' : '#172126'; ctx.lineWidth = enemy.boss ? 2 : 1;
    if (enemy.boss) { ctx.beginPath(); ctx.arc(0, 0, enemy.size, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#321e32'; ctx.beginPath(); ctx.arc(0, 0, enemy.size * .57, 0, TAU); ctx.fill(); ctx.fillStyle = '#f7d58a'; ctx.font = '700 22px serif'; ctx.textAlign = 'center'; ctx.fillText('♟', 0, 8); ctx.strokeStyle = enemy.phase === 2 ? '#7fc7f1' : '#f7d58a'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(0, 0, enemy.size + 8, -Math.PI / 2, Math.PI * 1.5); ctx.stroke(); ctx.setLineDash([]); }
    else if (enemy.air) { ctx.beginPath(); ctx.moveTo(-enemy.size, 0); ctx.quadraticCurveTo(-4, -enemy.size, 0, 0); ctx.quadraticCurveTo(4, -enemy.size, enemy.size, 0); ctx.quadraticCurveTo(4, enemy.size, 0, 3); ctx.quadraticCurveTo(-4, enemy.size, -enemy.size, 0); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.roundRect(-enemy.size, -enemy.size * .75, enemy.size * 2, enemy.size * 1.5, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#26343a'; ctx.beginPath(); ctx.arc(-enemy.size * .35, -2, 2, 0, TAU); ctx.arc(enemy.size * .35, -2, 2, 0, TAU); ctx.fill(); }
    ctx.shadowBlur = 0; if (enemy.stun > 0) { ctx.fillStyle = '#c5eaff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✦', -8, -enemy.size - 8); ctx.fillText('✦', 9, -enemy.size - 5); }
    ctx.restore();
    const barWidth = enemy.boss ? 85 : enemy.size * 2.7; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - (enemy.boss ? 16 : 8), barWidth, 3); ctx.fillStyle = enemy.boss ? '#ed7876' : '#79c697'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - (enemy.boss ? 16 : 8), barWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), 3); if (enemy.shield > 0) { ctx.strokeStyle = '#9abbd1'; ctx.strokeRect(enemy.x - barWidth / 2 - 1, enemy.y - enemy.size - (enemy.boss ? 17 : 9), barWidth + 2, 5); }
  }
  function drawProjectile(ctx, shot) { ctx.save(); ctx.strokeStyle = shot.color; ctx.fillStyle = shot.color; ctx.shadowColor = shot.color; ctx.shadowBlur = 13; if (shot.type === 'ice') { ctx.beginPath(); ctx.moveTo(shot.x - 6, shot.y + 5); ctx.lineTo(shot.x + 6, shot.y - 5); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.type === 'cannon' ? 5 : 3, 0, TAU); ctx.fill(); } ctx.restore(); }
  function drawHero(ctx) {
    const hero = battle.hero; ctx.save(); ctx.translate(hero.x, hero.y); ctx.shadowColor = hero.color; ctx.shadowBlur = hero.buff > 0 ? 28 : 14; ctx.fillStyle = '#142029'; ctx.strokeStyle = hero.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = hero.color; ctx.font = '700 21px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(hero.symbol, 0, 1); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#f0f5e9'; ctx.font = '700 9px Barlow Condensed, sans-serif'; ctx.fillText(hero.name.toUpperCase(), -20, 34); ctx.strokeStyle = hero.buff > 0 ? '#d4afee' : 'rgba(255,255,255,.18)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.arc(0, 0, hero.range, 0, TAU); ctx.globalAlpha = .11; ctx.stroke(); ctx.restore();
  }
  function drawParticles(ctx) { battle.particles.forEach(p => { ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.max), 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1; ctx.shadowBlur = 0; }
  function drawFloaters(ctx) { battle.floaters.forEach(f => { ctx.globalAlpha = clamp(f.life * 1.6, 0, 1); ctx.fillStyle = f.color; ctx.font = '700 11px Barlow Condensed, sans-serif'; ctx.textAlign = 'center'; ctx.shadowColor = '#000'; ctx.shadowBlur = 3; ctx.fillText(f.text, f.x, f.y); }); ctx.globalAlpha = 1; ctx.shadowBlur = 0; }

  function endBattle(won) {
    if (!battle || battle.ended) return; battle.ended = true; battle.running = false; battle.waveRunning = false; battle.active = false; selectedResultStage = battle.stage.number;
    if (won) {
      const firstClear = !state.clearedStages.includes(battle.stage.number); if (firstClear) state.clearedStages.push(battle.stage.number);
      const reward = 120 + battle.stage.number * 4; const xp = 80 + battle.stage.number * 5; state.gold += reward; state.xp += xp; state.stats.wins++; if (battle.stage.boss) state.stats.bosses++;
      state.currentStage = Math.max(state.currentStage, Math.min(200, battle.stage.number + 1)); if (state.xp >= state.level * 110) { state.xp -= state.level * 110; state.level++; }
      saveGame(); renderResources(); $('#result-kicker').textContent = `VICTORY · ${battle.stage.boss ? 'THE BOSS IS BROKEN' : 'THE CITADEL HOLDS'}`; $('#result-emblem').textContent = battle.stage.boss ? '♟' : '✦'; $('#result-title').textContent = battle.stage.boss ? 'BOSS DEFEATED' : 'RIFT SEALED'; $('#result-copy').textContent = battle.proof ? 'The Tower of Proof recognizes your discipline.' : 'Your strategy held against the verdant tide.'; $('#result-gold').textContent = `+${reward}`; $('#result-xp').textContent = `+${xp}`; $('#result-loot').textContent = battle.stage.boss ? '✧ Soul Stone' : '✧ Magic Stone'; $('#result-stars').innerHTML = '<span>★</span><span>★</span><span>★</span>';
      $('#result-modal').hidden = false; addBattleLog('Victory rewards secured.');
    } else {
      state.stats.losses++; saveGame(); $('#result-kicker').textContent = 'DEFEAT · THE RIFT ADVANCES'; $('#result-emblem').textContent = '×'; $('#result-title').textContent = 'LINE BROKEN'; $('#result-copy').textContent = 'Every defeat leaves a lesson. Rebuild your formation and return.'; $('#result-gold').textContent = '+0'; $('#result-xp').textContent = '+20'; $('#result-loot').textContent = 'The codex remembers'; $('#result-stars').innerHTML = '<span style="opacity:.25">★</span><span style="opacity:.25">★</span><span style="opacity:.25">★</span>'; $('#result-modal').hidden = false;
    }
  }

  async function init() {
    await loadGame(); renderLobby(); initNavigation(); setupCanvas();
    $$('[data-collection-tab]').forEach(btn => btn.addEventListener('click', () => { collectionTab = btn.dataset.collectionTab; $$('[data-collection-tab]').forEach(b => b.classList.toggle('active', b === btn)); renderCollection(); }));
    let countdown = 4 * 3600 + 28 * 60 + 16; setInterval(() => { countdown = Math.max(0, countdown - 1); const h = Math.floor(countdown / 3600), m = Math.floor(countdown % 3600 / 60), s = countdown % 60; setText('event-countdown', `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`); }, 1000);
    setInterval(saveGame, 30000);
  }
  init();
})();
