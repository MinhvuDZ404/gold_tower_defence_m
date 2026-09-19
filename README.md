# GOLD TOWER DEFENCE M

A playable browser-first fantasy tower-defense RPG built for GitHub Pages. This version keeps the Gold Tower Defence M DNA — build towers, move a hero, exploit the Scissors / Rock / Paper wheel, survive real waves, and defeat a multi-phase boss — while adding a sharper command-lobby presentation and expandable game systems.

## Play locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

The project is intentionally dependency-free: `index.html`, `styles.css`, and `app.js` can be deployed directly to GitHub Pages.

## Current playable slice

- Lobby with live event framing, daily operations, streaks, featured hero and quick access.
- Campaign map with 10 regions and 200-stage progression model.
- Canvas combat with a winding lane, build pads, an automatically granted Thorn scout tower, hero movement and enemy pathing.
- 10 distinct towers: Thorn, Ice Arrow, Assassin, Shuriken, Magic, Lightning, Nun, Cannon, Wolf and Blossom.
- Tower roles include single-target, slow, crit, multi-target, splash, chain, support, rapid and aura mechanics.
- Scissors > Rock > Paper > Scissors attribute counters with readable `WEAK!` combat feedback.
- Mixed waves featuring runners, flyers, armor, healers, splitters, assassins and a three-phase Root of Night boss.
- Meteor, Frostbind and Rally abilities, resource management, gold upgrades, tower selling and hero relocation.
- Victory / defeat result flow, campaign progression, XP, boss count, missions, rewards and summon presentation.
- Hero and tower codex, challenges, Tower of Proof ruleset and endless mode entry points.
- IndexedDB save with localStorage backup, responsive desktop / mobile layouts and touch-friendly controls.
- Original CSS scene art and canvas-rendered combat art/effects — no external asset pipeline required.

## Controls

1. Choose **Continue Campaign** or a stage on the **Campaign Map**.
2. Pick a tower card, then tap/click a glowing pad to deploy it.
3. Tap a built tower to upgrade or sell it.
4. Click/tap the battlefield to move the hero and set the Meteor target.
5. Start each wave, counter enemy attributes, and save Frostbind / Rally for the close call.

Progress is saved automatically in the browser. The first summon each session/save is free.
