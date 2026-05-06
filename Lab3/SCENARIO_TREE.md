# The Tithe of Blood - Narrative Scenario Tree

## Narrative Structure

```text
START (index.html)
 └─ l1_briefing.html (Command Bunker)
     ├─ l2_deployment.html (Western Front)
     │   ├─ l3_trench_charge.html (Trench Charge)
     │   │   ├─ l4_melee.html (Melee Combat)
     │   │   │   ├─ l5_boss_fight.html
     │   │   │   └─ l_death_melee.html [DEATH]
     │   │   └─ l4_save_comrade.html (Save Vox)
     │   │       ├─ l5_extraction.html
     │   │       └─ l_death_sacrifice.html [DEATH]
     │   └─ l3_trench_defend.html (Trench Defense)
     │       ├─ l4_artillery.html (Artillery Strike)
     │       │   ├─ l5_counter_attack.html (Counter-Attack)
     │       │   │   ├─ l6_waaagh.html
     │       │   │   └─ l6_upper_spire.html (Upper Spire Path) -> [SEE BELOW]
     │       │   └─ l_death_artillery.html [DEATH]
     │       └─ l4_fall_back.html (Fall Back)
     │           ├─ l5_hive_gate.html (Hive Gate)
     │           │   ├─ l6_underhive.html (Underhive Path) -> [SEE BELOW]
     │           │   └─ l6_upper_spire.html (Upper Spire Path) -> [SEE BELOW]
     │           └─ l_death_overrun.html [DEATH]
     └─ l_death_general.html [DEATH] (Lack of preparedness)

---

UNDERHIVE PATH
l6_underhive.html
 ├─ l7_sewers.html
 │   ├─ l8_pumping_station.html
 │   │   ├─ l9_sabotage.html
 │   │   │   ├─ l10_escape.html
 │   │   │   │   ├─ outro_hero.html (Victory - Hero of Ocularis)
 │   │   │   │   └─ outro_martyr.html (Ending - Martyr's Rest)
 │   │   │   └─ l_death_explosion.html [DEATH]
 │   │   └─ l9_stealth.html
 │   └─ l_death_mutants.html [DEATH]
 └─ l7_cult_ambush.html
     ├─ l8_stand_ground.html
     └─ l_death_chaos.html [DEATH]

---

UPPER SPIRE PATH
l6_upper_spire.html
 ├─ l7_noble_court.html
 │   ├─ l8_assassination.html
 │   └─ l8_diplomacy.html
 │       ├─ l9_militia_rise.html -> (Expected: l10_victory_spire.html)
 │       └─ l_death_traitor.html [DEATH]
 └─ l7_vox_array.html
     ├─ l8_call_reinforcements.html -> (Expected: l10_victory_spire.html)
     └─ l_death_sniper.html [DEATH]

---

HIDDEN / WIP ENDING
l10_victory_spire.html
 └─ outro_hero.html (Victory)
```

## Metadata
- [WIP]: Referenced in code; file not found in directory.
- [DEATH]: State leading back to index.html.
- Pathing: Arrows (->) indicate transitions to sub-structures described below.
