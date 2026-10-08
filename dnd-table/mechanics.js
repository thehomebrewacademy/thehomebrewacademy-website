// How each built-in class feature, subclass feature and species trait works, in the same format a Content Pack uses
// for its "abilities". The rules text itself lives in rules.js. Load this file after rules.js.
//
// An entry can change the sheet's numbers (statics), give something to activate (activation, roll, damage, onUse...),
// define a pool of uses (resource), or offer a choice (options). A value that changes with level can be written as a
// list of 20 values, one per level. See the Content Pack prompt for every field.
(function () {
  const R = window.HBA_RULES || { classes: {}, species: {} };
  const table = (cls, key) => ((R.classes[cls] || {}).table || {})[key] || [];
  const min = (n) => ({ amount: n, unit: "minutes" }), rounds = (n) => ({ amount: n, unit: "rounds" }), hours = (n) => ({ amount: n, unit: "hours" });
  const cls = (c, level, name, rest) => ({ name, grantedBy: { type: "class", name: c, level }, ...rest });
  const sub = (c, s, level, name, rest) => ({ name, grantedBy: { type: "subclass", name: s, class: c, level }, ...rest });
  const spc = (s, name, rest, level) => ({ name, grantedBy: { type: "species", name: s, level: level || 1 }, ...rest });
  const lin = (s, option, name, rest, level) => ({ name, grantedBy: { type: "lineage", species: s, name: option, level: level || 1 }, ...rest });
  const dice = (list, sides, plus) => list.map((n) => `${n}d${sides}${plus || ""}`);        // [2,2,3] -> ["2d6","2d6","3d6"]
  const byLevel = (pairs) => { const out = []; let v = 0; for (let l = 1; l <= 20; l++) { if (pairs[l] != null) v = pairs[l]; out.push(v); } return out; };
  const spellsAt = (map) => ({ spells: map }); // {3:[...], 5:[...]} always prepared from that level
  const M = [];

  /* ───────────── BARBARIAN ───────────── */
  const rageDmg = table("Barbarian", "rage_damage_bonus");
  M.push(
    cls("Barbarian", 1, "Rage", { resource: { name: "Rage", max: table("Barbarian", "rage_count"), recharge: "long", shortRegain: 1 },
      activation: "bonus", target: "self", roll: "none", uses: { pool: "Rage", cost: 1 },
      onUse: { effects: [{ name: "Rage", duration: min(10), resistDamage: ["Bludgeoning", "Piercing", "Slashing"], damageBonus: rageDmg, damageBonusFor: "Strength",
        advantageOnSaves: "Strength", note: "Advantage on Strength checks. You can't maintain Concentration or cast spells. It ends early unless each round you attack, force a saving throw or spend a Bonus Action to extend it." }] } }),
    cls("Barbarian", 1, "Weapon Mastery", { statics: { weaponMasteries: table("Barbarian", "weapon_mastery") } }),
    cls("Barbarian", 1, "Unarmored Defense", { statics: { acBase: { formula: "10+DEX+CON", shield: true } } }),
    cls("Barbarian", 2, "Danger Sense", { statics: { saveAdvantage: ["Dexterity"] } }),
    cls("Barbarian", 2, "Reckless Attack", { activation: "free", target: "self", roll: "none",
      onUse: { effects: [{ name: "Reckless Attack", duration: rounds(1), attackAdvantage: "Strength", attacksAgainstHaveAdvantage: true }] } }),
    cls("Barbarian", 3, "Primal Knowledge", { statics: { skillPicks: { class: 1 } } }),
    cls("Barbarian", 5, "Extra Attack", { statics: { passives: { attacks: 2 } } }),
    cls("Barbarian", 5, "Fast Movement", { statics: { speed: { formula: 10, when: "noHeavy" } } }),
    cls("Barbarian", 7, "Feral Instinct", { statics: { passives: { initiativeAdvantage: true } } }),
    cls("Barbarian", 9, "Brutal Strike: Forceful Blow", { feature: "Brutal Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 9: "1d10", 17: "2d10" }), type: "" }],
      text: "Use after a hit with a Strength-based attack on which you gave up Reckless Attack's Advantage. The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks." }),
    cls("Barbarian", 9, "Brutal Strike: Hamstring Blow", { feature: "Brutal Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 9: "1d10", 17: "2d10" }), type: "" }],
      onUse: { effects: [{ name: "Hamstring Blow", duration: rounds(1), speed: -15 }] } }),
    cls("Barbarian", 13, "Brutal Strike: Staggering Blow", { feature: "Improved Brutal Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 13: "1d10", 17: "2d10" }), type: "" }],
      onUse: { effects: [{ name: "Staggering Blow", duration: rounds(1), note: "Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks." }] } }),
    cls("Barbarian", 13, "Brutal Strike: Sundering Blow", { feature: "Improved Brutal Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 13: "1d10", 17: "2d10" }), type: "" }],
      onUse: { effects: [{ name: "Sundering Blow", duration: rounds(1), note: "The next attack roll made by another creature against it gains a +5 bonus." }] } }),
    cls("Barbarian", 11, "Relentless Rage", { activation: "free", target: "self", roll: "none" }),
    cls("Barbarian", 15, "Persistent Rage", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    cls("Barbarian", 20, "Primal Champion", { statics: { scores: { Strength: 4, Constitution: 4 } } }),
    sub("Barbarian", "Path of the Berserker", 3, "Frenzy", { activation: "free", target: "creature", roll: "none", damage: [{ dice: rageDmg.map((n) => `${n}d6`), type: "" }] }),
    sub("Barbarian", "Path of the Berserker", 6, "Mindless Rage", { activation: "free", target: "self", roll: "none",
      onUse: { effects: [{ name: "Mindless Rage (Charmed)", duration: min(10), immuneTo: "Charmed" }, { name: "Mindless Rage (Frightened)", duration: min(10), immuneTo: "Frightened" }] } }),
    sub("Barbarian", "Path of the Berserker", 10, "Retaliation", { activation: "reaction", target: "self", roll: "none" }),
    sub("Barbarian", "Path of the Berserker", 14, "Intimidating Presence", { activation: "bonus", target: "creature", targets: "any", roll: "save", save: { ability: "Wisdom", dc: "8+STR+PROF" },
      onFail: { conditions: [{ name: "Frightened", duration: min(1), repeatSave: { when: "end", turn: "target" } }] }, uses: { max: 1, recharge: "long" } })
  );

  /* ───────────── BARD ───────────── */
  const bardDie = table("Bard", "bardic_inspiration_die").map((n) => "d" + n);
  M.push(
    cls("Bard", 1, "Bardic Inspiration", { resource: { name: "Bardic Inspiration", max: "MAX(1,CHA)", recharge: byLevel({ 1: "long", 5: "short" }) },
      activation: "bonus", target: "creature", roll: "none", uses: { pool: "Bardic Inspiration", cost: 1 },
      onUse: { effects: [{ name: "Bardic Inspiration", duration: hours(1), inspirationDie: bardDie }] } }),
    cls("Bard", 2, "Jack of All Trades", { statics: { halfProficiency: true } }),
    cls("Bard", 7, "Countercharm", { activation: "reaction", target: "self", roll: "none" }),
    cls("Bard", 20, "Words of Creation", { statics: spellsAt({ 20: ["Power Word Heal", "Power Word Kill"] }) }),
    sub("Bard", "College of Lore", 3, "Bonus Proficiencies", { statics: { skillPicks: { any: 3 } } }),
    sub("Bard", "College of Lore", 3, "Cutting Words", { activation: "reaction", target: "self", roll: "none", uses: { pool: "Bardic Inspiration", cost: 1 } }),
    sub("Bard", "College of Lore", 14, "Peerless Skill", { activation: "free", target: "self", roll: "none", uses: { pool: "Bardic Inspiration", cost: 1 } })
  );

  /* ───────────── CLERIC ───────────── */
  const sparkDice = byLevel({ 2: "1d8+WIS", 7: "2d8+WIS", 13: "3d8+WIS", 18: "4d8+WIS" });
  M.push(
    cls("Cleric", 1, "Divine Order", { options: { label: "Divine Order", choices: [
      { name: "Protector", statics: { proficiencies: { armor: ["Heavy"], weapons: ["Martial"] } } },
      { name: "Thaumaturge", statics: { cantripBonus: 1, skillBonus: { skills: ["Arcana", "Religion"], formula: "MAX(1,WIS)" } } }] } }),
    cls("Cleric", 2, "Channel Divinity", { resource: { name: "Channel Divinity", max: table("Cleric", "channel_divinity_charges"), recharge: "long", shortRegain: 1 } }),
    cls("Cleric", 2, "Divine Spark (heal)", { feature: "Channel Divinity", activation: "action", target: "creature", roll: "none", heal: sparkDice, uses: { pool: "Channel Divinity", cost: 1 } }),
    cls("Cleric", 2, "Divine Spark (harm)", { feature: "Channel Divinity", activation: "action", target: "creature", roll: "save", save: { ability: "Constitution", dc: "SPELLDC" },
      damage: [{ dice: sparkDice, type: "Radiant" }], halfOnSave: true, uses: { pool: "Channel Divinity", cost: 1 } }),
    cls("Cleric", 2, "Turn Undead", { feature: "Channel Divinity", activation: "action", target: "creature", targets: "any", roll: "save", save: { ability: "Wisdom", dc: "SPELLDC" },
      onFail: { conditions: [{ name: "Frightened", duration: min(1) }, { name: "Incapacitated", duration: min(1) }] }, uses: { pool: "Channel Divinity", cost: 1 },
      atLevel: { 5: { damage: [{ dice: "(MAX(1,WIS))d8", type: "Radiant" }] } } }),
    cls("Cleric", 7, "Blessed Strikes", { options: { label: "Blessed Strikes", choices: [
      { name: "Divine Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 7: "1d8", 14: "2d8" }), type: "Radiant" }],
        text: "Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage (your choice). Use this after the hit." },
      { name: "Potent Spellcasting", statics: { cantripDamage: "WIS" } }] } }),
    cls("Cleric", 10, "Divine Intervention", { activation: "action", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    sub("Cleric", "Life Domain", 3, "Disciple of Life", { statics: { passives: { discipleOfLife: true } } }),
    sub("Cleric", "Life Domain", 3, "Life Domain Spells", { statics: spellsAt({ 3: ["Aid", "Bless", "Cure Wounds", "Lesser Restoration"], 5: ["Mass Healing Word", "Revivify"], 7: ["Aura of Life", "Death Ward"], 9: ["Greater Restoration", "Mass Cure Wounds"] }) }),
    sub("Cleric", "Life Domain", 3, "Preserve Life", { activation: "action", target: "creature", targets: "any", roll: "none", heal: "5", uses: { pool: "Channel Divinity", cost: 1 },
      text: "As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to evoke healing energy that can restore a number of Hit Points equal to five times your Cleric level. Choose Bloodied creatures within 30 feet of yourself (which can include you), and divide those Hit Points among them. This feature can restore a creature to no more than half its Hit Point maximum. The app heals each chosen creature 5: use the HP buttons to divide the rest." }),
    sub("Cleric", "Life Domain", 6, "Blessed Healer", { statics: { passives: { blessedHealer: true } } }),
    sub("Cleric", "Life Domain", 17, "Supreme Healing", { statics: { passives: { supremeHealing: true } } })
  );

  /* ───────────── DRUID ───────────── */
  const land = (name, spells, resist) => ({ name, statics: { spells }, atLevel: { 10: { statics: { resist: [resist], conditionImmune: ["Poisoned"] } } } });
  M.push(
    cls("Druid", 1, "Druidic", { statics: spellsAt({ 1: ["Speak with Animals"] }) }),
    cls("Druid", 1, "Primal Order", { options: { label: "Primal Order", choices: [
      { name: "Magician", statics: { cantripBonus: 1, skillBonus: { skills: ["Arcana", "Nature"], formula: "MAX(1,WIS)" } } },
      { name: "Warden", statics: { proficiencies: { armor: ["Medium"], weapons: ["Martial"] } } }] } }),
    cls("Druid", 2, "Wild Shape", { resource: { name: "Wild Shape", max: table("Druid", "wild_shape_uses"), recharge: "long", shortRegain: 1 },
      activation: "bonus", target: "self", roll: "none", statBlock: "form", uses: { pool: "Wild Shape", cost: 1 } }),
    cls("Druid", 2, "Wild Companion", { activation: "action", target: "self", roll: "none", statBlock: "summon", uses: { pool: "Wild Shape", cost: 1 } }),
    cls("Druid", 7, "Elemental Fury", { options: { label: "Elemental Fury", choices: [
      { name: "Potent Spellcasting", statics: { cantripDamage: "WIS" } },
      { name: "Primal Strike", activation: "free", target: "creature", roll: "none", damage: [{ dice: byLevel({ 7: "1d8", 15: "2d8" }), type: "Elemental" }],
        text: "Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form's attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage (choose when you hit). Use this after the hit." }] } }),
    sub("Druid", "Circle of the Land", 3, "Circle of the Land Spells", { options: { label: "Land type", changeOn: "long", choices: [
      land("Arid", { 3: ["Blur", "Burning Hands", "Fire Bolt"], 5: ["Fireball"], 7: ["Blight"], 9: ["Wall of Stone"] }, "Fire"),
      land("Polar", { 3: ["Fog Cloud", "Hold Person", "Ray of Frost"], 5: ["Sleet Storm"], 7: ["Ice Storm"], 9: ["Cone of Cold"] }, "Cold"),
      land("Temperate", { 3: ["Misty Step", "Shocking Grasp", "Sleep"], 5: ["Lightning Bolt"], 7: ["Freedom of Movement"], 9: ["Tree Stride"] }, "Lightning"),
      land("Tropical", { 3: ["Acid Splash", "Ray of Sickness", "Web"], 5: ["Stinking Cloud"], 7: ["Polymorph"], 9: ["Insect Plague"] }, "Poison")] } }),
    sub("Druid", "Circle of the Land", 3, "Land's Aid", { activation: "action", target: "creature", targets: "any", roll: "save", save: { ability: "Constitution", dc: "SPELLDC" },
      damage: [{ dice: byLevel({ 3: "2d6", 10: "3d6", 14: "4d6" }), type: "Necrotic" }], halfOnSave: true, uses: { pool: "Wild Shape", cost: 1 } }),
    sub("Druid", "Circle of the Land", 6, "Natural Recovery", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    sub("Druid", "Circle of the Land", 14, "Nature's Sanctuary", { activation: "action", target: "self", roll: "none", uses: { pool: "Wild Shape", cost: 1 } })
  );

  /* ───────────── FIGHTER ───────────── */
  M.push(
    cls("Fighter", 1, "Second Wind", { resource: { name: "Second Wind", max: table("Fighter", "second_wind_uses"), recharge: "long", shortRegain: 1 },
      activation: "bonus", target: "self", roll: "none", heal: "1d10+LEVEL", uses: { pool: "Second Wind", cost: 1 } }),
    cls("Fighter", 1, "Weapon Mastery", { statics: { weaponMasteries: table("Fighter", "weapon_mastery") } }),
    cls("Fighter", 2, "Action Surge", { activation: "free", target: "self", roll: "none", uses: { max: byLevel({ 2: 1, 17: 2 }), recharge: "short" } }),
    cls("Fighter", 2, "Tactical Mind", { activation: "free", target: "self", roll: "none", uses: { pool: "Second Wind", cost: 1 },
      text: "When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn't expended: give it back with the + beside Second Wind." }),
    cls("Fighter", 5, "Extra Attack", { statics: { passives: { attacks: byLevel({ 5: 2, 11: 3, 20: 4 }) } } }),
    cls("Fighter", 9, "Indomitable", { activation: "free", target: "self", roll: "none", uses: { max: byLevel({ 9: 1, 13: 2, 17: 3 }), recharge: "long" } }),
    sub("Fighter", "Champion", 3, "Improved Critical", { statics: { passives: { criticalOn: byLevel({ 3: 19, 15: 18 }) } } }),
    sub("Fighter", "Champion", 3, "Remarkable Athlete", { statics: { passives: { initiativeAdvantage: true } } })
  );

  /* ───────────── MONK ───────────── */
  const maDie = table("Monk", "martial_arts_die");
  M.push(
    cls("Monk", 1, "Martial Arts", { statics: { unarmedDie: maDie, unarmedDexterity: true, monkWeapons: true } }),
    cls("Monk", 1, "Unarmored Defense", { statics: { acBase: { formula: "10+DEX+WIS", shield: false } } }),
    cls("Monk", 2, "Monk's Focus", { resource: { name: "Focus Points", max: table("Monk", "focus_points"), recharge: "short" } }),
    cls("Monk", 2, "Flurry of Blows", { feature: "Monk's Focus", activation: "bonus", target: "self", roll: "none", uses: { pool: "Focus Points", cost: 1 },
      text: "You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action (three from Monk level 10). Spend the point here, then make the strikes." }),
    cls("Monk", 2, "Patient Defense", { feature: "Monk's Focus", activation: "bonus", target: "self", roll: "none", uses: { pool: "Focus Points", cost: 1 },
      onUse: { effects: [{ name: "Dodge", duration: rounds(1), attacksAgainstHaveDisadvantage: true, advantageOnSaves: "Dexterity" }] },
      text: "You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action." }),
    cls("Monk", 2, "Step of the Wind", { feature: "Monk's Focus", activation: "bonus", target: "self", roll: "none", uses: { pool: "Focus Points", cost: 1 },
      text: "You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and your jump distance is doubled for the turn." }),
    cls("Monk", 2, "Unarmored Movement", { statics: { speed: { formula: table("Monk", "unarmored_movement_bonus"), when: "noArmorNoShield" } } }),
    cls("Monk", 2, "Uncanny Metabolism", { activation: "free", target: "self", roll: "none", heal: maDie.map((d) => `1d${d}+LEVEL`), uses: { max: 1, recharge: "long" } }),
    cls("Monk", 3, "Deflect Attacks", { activation: "reaction", target: "self", roll: "none" }),
    cls("Monk", 4, "Slow Fall", { activation: "reaction", target: "self", roll: "none" }),
    cls("Monk", 5, "Extra Attack", { statics: { passives: { attacks: 2 } } }),
    cls("Monk", 5, "Stunning Strike", { activation: "free", target: "creature", roll: "save", save: { ability: "Constitution", dc: "8+PROF+WIS" },
      onFail: { conditions: [{ name: "Stunned", duration: rounds(1) }] },
      onSuccess: { effects: [{ name: "Stunning Strike", duration: rounds(1), speedMultiplier: 0.5, attacksAgainstHaveAdvantage: true }] }, uses: { pool: "Focus Points", cost: 1 } }),
    cls("Monk", 7, "Evasion", { statics: { passives: { evasion: true } } }),
    cls("Monk", 10, "Self-Restoration", { activation: "free", target: "self", roll: "none" }),
    cls("Monk", 14, "Disciplined Survivor", { statics: { saveProficiency: "all" } }),
    cls("Monk", 18, "Superior Defense", { activation: "free", target: "self", roll: "none", uses: { pool: "Focus Points", cost: 3 },
      onUse: { effects: [{ name: "Superior Defense", duration: min(1), resistDamage: ["Acid", "Bludgeoning", "Cold", "Fire", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"] }] } }),
    cls("Monk", 20, "Body and Mind", { statics: { scores: { Dexterity: 4, Wisdom: 4 } } }),
    sub("Monk", "Warrior of the Open Hand", 3, "Open Hand Technique: Topple", { feature: "Open Hand Technique", activation: "free", target: "creature", roll: "save", save: { ability: "Dexterity", dc: "8+PROF+WIS" },
      onFail: { conditions: [{ name: "Prone" }] } }),
    sub("Monk", "Warrior of the Open Hand", 3, "Open Hand Technique: Push", { feature: "Open Hand Technique", activation: "free", target: "creature", roll: "save", save: { ability: "Strength", dc: "8+PROF+WIS" },
      text: "The target must succeed on a Strength saving throw or be pushed up to 15 feet away from you." }),
    sub("Monk", "Warrior of the Open Hand", 6, "Wholeness of Body", { activation: "bonus", target: "self", roll: "none", heal: maDie.map((d) => `1d${d}+WIS`), uses: { max: "MAX(1,WIS)", recharge: "long" } }),
    sub("Monk", "Warrior of the Open Hand", 17, "Quivering Palm", { activation: "action", target: "creature", roll: "save", save: { ability: "Constitution", dc: "8+PROF+WIS" },
      damage: [{ dice: "10d12", type: "Force" }], halfOnSave: true, uses: { pool: "Focus Points", cost: 4 } })
  );

  /* ───────────── PALADIN ───────────── */
  M.push(
    cls("Paladin", 1, "Lay On Hands", { resource: { name: "Lay On Hands", max: "LEVEL*5", recharge: "long" } }),
    cls("Paladin", 1, "Lay On Hands (5 Hit Points)", { feature: "Lay On Hands", activation: "bonus", target: "creature", roll: "none", heal: "5", uses: { pool: "Lay On Hands", cost: 5 } }),
    cls("Paladin", 1, "Lay On Hands (1 Hit Point)", { feature: "Lay On Hands", activation: "bonus", target: "creature", roll: "none", heal: "1", uses: { pool: "Lay On Hands", cost: 1 } }),
    cls("Paladin", 1, "Weapon Mastery", { statics: { weaponMasteries: 2 } }),
    cls("Paladin", 2, "Paladin's Smite", { statics: spellsAt({ 2: ["Divine Smite"] }) }),
    cls("Paladin", 3, "Channel Divinity", { resource: { name: "Channel Divinity", max: table("Paladin", "channel_divinity_charges"), recharge: "long", shortRegain: 1 } }),
    cls("Paladin", 3, "Divine Sense", { feature: "Channel Divinity", activation: "bonus", target: "self", roll: "none", uses: { pool: "Channel Divinity", cost: 1 },
      text: "As a Bonus Action, you can open your awareness to detect Celestials, Fiends, and Undead. For the next 10 minutes or until you have the Incapacitated condition, you know the location of any creature of those types within 60 feet of yourself, and you know its creature type." }),
    cls("Paladin", 5, "Extra Attack", { statics: { passives: { attacks: 2 } } }),
    cls("Paladin", 5, "Faithful Steed", { statics: spellsAt({ 5: ["Find Steed"] }) }),
    cls("Paladin", 6, "Aura of Protection", { statics: { saveBonus: "MAX(1,CHA)" }, activation: "free", target: "creature", targets: "any", roll: "none",
      onUse: { effects: [{ name: "Aura of Protection", savingThrows: "MAX(1,CHA)", note: "Only while within the Paladin's aura. Remove it when the creature leaves." }] } }),
    cls("Paladin", 9, "Abjure Foes", { activation: "action", target: "creature", targets: "MAX(1,CHA)", roll: "save", save: { ability: "Wisdom", dc: "SPELLDC" },
      onFail: { conditions: [{ name: "Frightened", duration: min(1) }] }, uses: { pool: "Channel Divinity", cost: 1 } }),
    cls("Paladin", 10, "Aura of Courage", { statics: { conditionImmune: ["Frightened"] } }),
    cls("Paladin", 11, "Radiant Strikes", { statics: { weaponDamage: { dice: "1d8", type: "Radiant", when: "melee" } } }),
    sub("Paladin", "Oath of Devotion", 3, "Oath of Devotion Spells", { statics: spellsAt({ 3: ["Protection from Evil and Good", "Shield of Faith"], 5: ["Aid", "Zone of Truth"], 9: ["Beacon of Hope", "Dispel Magic"], 13: ["Freedom of Movement", "Guardian of Faith"], 17: ["Commune", "Flame Strike"] }) }),
    sub("Paladin", "Oath of Devotion", 3, "Sacred Weapon", { activation: "free", target: "self", roll: "none", uses: { pool: "Channel Divinity", cost: 1 },
      onUse: { effects: [{ name: "Sacred Weapon", duration: min(10), attackRolls: "MAX(1,CHA)", note: "The bonus is for attacks with the one imbued Melee weapon. It can deal Radiant damage instead of its normal type." }] } }),
    sub("Paladin", "Oath of Devotion", 7, "Aura of Devotion", { statics: { conditionImmune: ["Charmed"] } }),
    sub("Paladin", "Oath of Devotion", 20, "Holy Nimbus", { activation: "bonus", target: "self", roll: "none", uses: { max: 1, recharge: "long" },
      onUse: { effects: [{ name: "Holy Nimbus", duration: min(10), note: "Advantage on saving throws forced by a Fiend or an Undead. An enemy that starts its turn in the aura takes Radiant damage equal to your Charisma modifier plus your Proficiency Bonus. The aura is filled with Bright Light that is sunlight." }] } })
  );

  /* ───────────── RANGER ───────────── */
  M.push(
    cls("Ranger", 1, "Favored Enemy", { statics: spellsAt({ 1: ["Hunter's Mark"] }), activation: "bonus", target: "creature", roll: "none", uses: { max: table("Ranger", "favored_enemies"), recharge: "long" },
      onUse: { effects: [{ name: "Hunter's Mark", duration: hours(1), concentration: true, extraDamageFromUser: { dice: byLevel({ 1: "1d6", 20: "1d10" }), type: "Force" } }] } }),
    cls("Ranger", 1, "Weapon Mastery", { statics: { weaponMasteries: 2 } }),
    cls("Ranger", 5, "Extra Attack", { statics: { passives: { attacks: 2 } } }),
    cls("Ranger", 6, "Roving", { statics: { speed: { formula: 10, when: "noHeavy" } } }),
    cls("Ranger", 10, "Tireless", { activation: "action", target: "self", roll: "none", onUse: { tempHP: "1d8+MAX(1,WIS)" }, uses: { max: "MAX(1,WIS)", recharge: "long" } }),
    cls("Ranger", 14, "Nature's Veil", { activation: "bonus", target: "self", roll: "none", onUse: { conditions: [{ name: "Invisible", duration: rounds(2) }] }, uses: { max: "MAX(1,WIS)", recharge: "long" } }),
    cls("Ranger", 18, "Feral Senses", { statics: { senses: ["Blindsight 30 ft."] } }),
    sub("Ranger", "Hunter", 3, "Hunter's Prey", { options: { label: "Hunter's Prey", changeOn: "short", choices: [
      { name: "Colossus Slayer", activation: "free", target: "creature", roll: "none", damage: [{ dice: "1d8", type: "" }],
        text: "When you hit a creature with a weapon, the weapon deals an extra 1d8 damage to the target if it's missing any of its Hit Points. You can deal this extra damage only once per turn. Use this after the hit." },
      { name: "Horde Breaker" }] } }),
    sub("Ranger", "Hunter", 7, "Defensive Tactics", { options: { label: "Defensive Tactics", changeOn: "short", choices: [{ name: "Escape the Horde" }, { name: "Multiattack Defense" }] } }),
    sub("Ranger", "Hunter", 15, "Superior Hunter's Defense", { activation: "reaction", target: "self", roll: "none" })
  );

  /* ───────────── ROGUE ───────────── */
  const cunningDc = "8+DEX+PROF";
  M.push(
    cls("Rogue", 1, "Sneak Attack", { statics: { passives: { sneakAttackDice: table("Rogue", "sneak_attack").map((x) => (x && x.dice_count) || 0) } } }),
    cls("Rogue", 1, "Weapon Mastery", { statics: { weaponMasteries: 2 } }),
    cls("Rogue", 2, "Cunning Action", { activation: "bonus", target: "self", roll: "none" }),
    cls("Rogue", 3, "Steady Aim", { activation: "bonus", target: "self", roll: "none", onUse: { effects: [{ name: "Steady Aim", duration: rounds(1), attackAdvantage: true, note: "For your next attack roll this turn only. Your Speed is 0 until the end of the turn." }] } }),
    cls("Rogue", 5, "Cunning Strike: Poison", { feature: "Cunning Strike", activation: "free", target: "creature", roll: "save", save: { ability: "Constitution", dc: cunningDc },
      onFail: { conditions: [{ name: "Poisoned", duration: min(1), repeatSave: { when: "end", turn: "target" } }] },
      text: "Cost: 1d6 of your Sneak Attack. You add a toxin to your strike, forcing the target to make a Constitution saving throw. On a failed save, the target has the Poisoned condition for 1 minute. At the end of each of its turns, the Poisoned target repeats the save, ending the effect on itself on a success. To use this effect, you must have a Poisoner's Kit on your person." }),
    cls("Rogue", 5, "Cunning Strike: Trip", { feature: "Cunning Strike", activation: "free", target: "creature", roll: "save", save: { ability: "Dexterity", dc: cunningDc }, onFail: { conditions: [{ name: "Prone" }] },
      text: "Cost: 1d6 of your Sneak Attack. If the target is Large or smaller, it must succeed on a Dexterity saving throw or have the Prone condition." }),
    cls("Rogue", 5, "Uncanny Dodge", { activation: "reaction", target: "self", roll: "none" }),
    cls("Rogue", 7, "Evasion", { statics: { passives: { evasion: true } } }),
    cls("Rogue", 14, "Devious Strikes: Knock Out", { feature: "Devious Strikes", activation: "free", target: "creature", roll: "save", save: { ability: "Constitution", dc: cunningDc },
      onFail: { conditions: [{ name: "Unconscious", duration: min(1), repeatSave: { when: "end", turn: "target" } }] } }),
    cls("Rogue", 14, "Devious Strikes: Obscure", { feature: "Devious Strikes", activation: "free", target: "creature", roll: "save", save: { ability: "Dexterity", dc: cunningDc },
      onFail: { conditions: [{ name: "Blinded", duration: rounds(1) }] } }),
    cls("Rogue", 14, "Devious Strikes: Daze", { feature: "Devious Strikes", activation: "free", target: "creature", roll: "save", save: { ability: "Constitution", dc: cunningDc } }),
    cls("Rogue", 15, "Slippery Mind", { statics: { saveProficiency: ["Wisdom", "Charisma"] } }),
    cls("Rogue", 20, "Stroke of Luck", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "short" } }),
    sub("Rogue", "Thief", 3, "Fast Hands", { activation: "bonus", target: "self", roll: "none" })
  );

  /* ───────────── SORCERER ───────────── */
  M.push(
    cls("Sorcerer", 1, "Innate Sorcery", { activation: "bonus", target: "self", roll: "none", uses: { max: 2, recharge: "long" },
      onUse: { effects: [{ name: "Innate Sorcery", duration: min(1), spellSaveDC: 1, spellAttackAdvantage: true }] } }),
    cls("Sorcerer", 2, "Font of Magic", { resource: { name: "Sorcery Points", max: table("Sorcerer", "sorcery_points"), recharge: "long" } }),
    cls("Sorcerer", 2, "Metamagic", { activation: "free", target: "self", roll: "none", uses: { pool: "Sorcery Points", cost: 1 },
      text: "Spend 1 Sorcery Point here each time a Metamagic option costs one. You gain two Metamagic options of your choice; note them in Equipment and Notes." }),
    cls("Sorcerer", 5, "Sorcerous Restoration", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    sub("Sorcerer", "Draconic Sorcery", 3, "Draconic Resilience", { statics: { hp: "LEVEL", acBase: { formula: "10+DEX+CHA", shield: true } } }),
    sub("Sorcerer", "Draconic Sorcery", 3, "Draconic Spells", { statics: spellsAt({ 3: ["Alter Self", "Chromatic Orb", "Command", "Dragon's Breath"], 5: ["Fear", "Fly"], 7: ["Arcane Eye", "Charm Monster"], 9: ["Legend Lore", "Summon Dragon"] }) }),
    sub("Sorcerer", "Draconic Sorcery", 6, "Elemental Affinity", { options: { label: "Damage type", choices: ["Acid", "Cold", "Fire", "Lightning", "Poison"].map((t) => ({ name: t, statics: { resist: [t] } })) } }),
    sub("Sorcerer", "Draconic Sorcery", 14, "Dragon Wings", { activation: "bonus", target: "self", roll: "none", uses: { max: 1, recharge: "long" }, onUse: { effects: [{ name: "Dragon Wings", duration: hours(1), movement: "Fly 60 ft." }] } }),
    sub("Sorcerer", "Draconic Sorcery", 18, "Dragon Companion", { statics: spellsAt({ 18: ["Summon Dragon"] }) })
  );

  /* ───────────── WARLOCK ───────────── */
  M.push(
    cls("Warlock", 2, "Magical Cunning", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    cls("Warlock", 9, "Contact Patron", { statics: spellsAt({ 9: ["Contact Other Plane"] }) }),
    sub("Warlock", "Fiend Patron", 3, "Dark One's Blessing", { activation: "free", target: "self", roll: "none", onUse: { tempHP: "MAX(1,CHA+LEVEL)" } }),
    sub("Warlock", "Fiend Patron", 3, "Fiend Spells", { statics: spellsAt({ 3: ["Burning Hands", "Command", "Scorching Ray", "Suggestion"], 5: ["Fireball", "Stinking Cloud"], 7: ["Fire Shield", "Wall of Fire"], 9: ["Geas", "Insect Plague"] }) }),
    sub("Warlock", "Fiend Patron", 6, "Dark One's Own Luck", { activation: "free", target: "self", roll: "none", uses: { max: "MAX(1,CHA)", recharge: "long" } }),
    sub("Warlock", "Fiend Patron", 10, "Fiendish Resilience", { options: { label: "Damage type", changeOn: "short",
      choices: ["Acid", "Bludgeoning", "Cold", "Fire", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"].map((t) => ({ name: t, statics: { resist: [t] } })) } }),
    sub("Warlock", "Fiend Patron", 14, "Hurl Through Hell", { activation: "free", target: "creature", roll: "save", save: { ability: "Charisma", dc: "SPELLDC" }, damage: [{ dice: "8d10", type: "Psychic" }],
      onFail: { conditions: [{ name: "Incapacitated", duration: rounds(1) }] }, uses: { max: 1, recharge: "long" } })
  );

  /* ───────────── WIZARD ───────────── */
  M.push(
    cls("Wizard", 1, "Arcane Recovery", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    sub("Wizard", "Evoker", 3, "Potent Cantrip", { statics: { passives: { potentCantrip: true } } }),
    sub("Wizard", "Evoker", 10, "Empowered Evocation", { statics: { schoolDamage: { school: "Evocation", formula: "INT" } } }),
    sub("Wizard", "Evoker", 14, "Overchannel", { activation: "free", target: "self", roll: "none" })
  );

  /* ───────────── SPECIES ───────────── */
  M.push(
    spc("Dwarf", "Dwarven Resilience", { statics: { resist: ["Poison"], conditionAdvantage: ["Poisoned"] } }),
    spc("Dwarf", "Dwarven Toughness", { statics: { hp: "LEVEL" } }),
    spc("Dwarf", "Stonecunning", { activation: "bonus", target: "self", roll: "none", uses: { max: "PROF", recharge: "long" }, onUse: { effects: [{ name: "Stonecunning", duration: min(10), sense: "Tremorsense 60 ft." }] } }),
    spc("Elf", "Fey Ancestry", { statics: { conditionAdvantage: ["Charmed"] } }),
    lin("Elf", "Drow", "Drow lineage", { statics: { senses: ["Darkvision 120 ft."], spells: { 1: ["Dancing Lights"], 3: ["Faerie Fire"], 5: ["Darkness"] } } }),
    lin("Elf", "High Elf", "High Elf lineage", { statics: spellsAt({ 1: ["Prestidigitation"], 3: ["Detect Magic"], 5: ["Misty Step"] }) }),
    lin("Elf", "Wood Elf", "Wood Elf lineage", { statics: { speedBase: 35, spells: { 1: ["Druidcraft"], 3: ["Longstrider"], 5: ["Pass without Trace"] } } }),
    spc("Gnome", "Gnomish Cunning", { statics: { saveAdvantage: ["Intelligence", "Wisdom", "Charisma"] } }),
    lin("Gnome", "Forest Gnome", "Forest Gnome lineage", { statics: spellsAt({ 1: ["Minor Illusion", "Speak with Animals"] }) }),
    lin("Gnome", "Rock Gnome", "Rock Gnome lineage", { statics: spellsAt({ 1: ["Mending", "Prestidigitation"] }) }),
    spc("Goliath", "Large Form", { activation: "bonus", target: "self", roll: "none", uses: { max: 1, recharge: "long" }, onUse: { effects: [{ name: "Large Form", duration: min(10), speed: 10, note: "You are Large and have Advantage on Strength checks." }] } }, 5),
    lin("Goliath", "Cloud's Jaunt", "Cloud's Jaunt", { activation: "bonus", target: "self", roll: "none", uses: { max: "PROF", recharge: "long" } }),
    lin("Goliath", "Fire's Burn", "Fire's Burn", { activation: "free", target: "creature", roll: "none", damage: [{ dice: "1d10", type: "Fire" }], uses: { max: "PROF", recharge: "long" } }),
    lin("Goliath", "Frost's Chill", "Frost's Chill", { activation: "free", target: "creature", roll: "none", damage: [{ dice: "1d6", type: "Cold" }], onUse: { effects: [{ name: "Frost's Chill", duration: rounds(1), speed: -10 }] }, uses: { max: "PROF", recharge: "long" } }),
    lin("Goliath", "Hill's Tumble", "Hill's Tumble", { activation: "free", target: "creature", roll: "none", onUse: { conditions: [{ name: "Prone" }] }, uses: { max: "PROF", recharge: "long" } }),
    lin("Goliath", "Stone's Endurance", "Stone's Endurance", { activation: "reaction", target: "self", roll: "none", uses: { max: "PROF", recharge: "long" } }),
    lin("Goliath", "Storm's Thunder", "Storm's Thunder", { activation: "reaction", target: "creature", roll: "none", damage: [{ dice: "1d8", type: "Thunder" }], uses: { max: "PROF", recharge: "long" } }),
    spc("Halfling", "Brave", { statics: { conditionAdvantage: ["Frightened"] } }),
    spc("Orc", "Adrenaline Rush", { activation: "bonus", target: "self", roll: "none", onUse: { tempHP: "PROF" }, uses: { max: "PROF", recharge: "short" } }),
    spc("Orc", "Relentless Endurance", { activation: "free", target: "self", roll: "none", uses: { max: 1, recharge: "long" } }),
    spc("Tiefling", "Otherworldly Presence", { statics: spellsAt({ 1: ["Thaumaturgy"] }) }),
    lin("Tiefling", "Abyssal", "Abyssal legacy", { statics: { resist: ["Poison"], spells: { 1: ["Poison Spray"], 3: ["Ray of Sickness"], 5: ["Hold Person"] } } }),
    lin("Tiefling", "Chthonic", "Chthonic legacy", { statics: { resist: ["Necrotic"], spells: { 1: ["Chill Touch"], 3: ["False Life"], 5: ["Ray of Enfeeblement"] } } }),
    lin("Tiefling", "Infernal", "Infernal legacy", { statics: { resist: ["Fire"], spells: { 1: ["Fire Bolt"], 3: ["Hellish Rebuke"], 5: ["Darkness"] } } }),
    spc("Dragonborn", "Draconic Flight", { activation: "bonus", target: "self", roll: "none", uses: { max: 1, recharge: "long" }, onUse: { effects: [{ name: "Draconic Flight", duration: min(10), movement: "Fly (equal to your Speed)" }] } }, 5)
  );
  const dragon = ((R.species.Dragonborn || {}).lineage || {}).options || {};
  Object.keys(dragon).forEach((color) => {
    const type = dragon[color].damageType;
    M.push(
      lin("Dragonborn", color, `Damage Resistance: ${type}`, { statics: { resist: [type] } }),
      lin("Dragonborn", color, `Breath Weapon (${type})`, { activation: "action", target: "creature", targets: "any", roll: "save", save: { ability: "Dexterity", dc: "8+CON+PROF" },
        damage: [{ dice: byLevel({ 1: "1d10", 5: "2d10", 11: "3d10", 17: "4d10" }), type }], halfOnSave: true, uses: { max: "PROF", recharge: "long" }, range: { kind: "self", feet: 0 },
        versions: [{ name: "15-foot Cone", area: { shape: "cone", size: 15 } }, { name: "30-foot Line", area: { shape: "line", size: 30, width: 5 } }] })
    );
  });

  window.HBA_MECHANICS = M;
})();
