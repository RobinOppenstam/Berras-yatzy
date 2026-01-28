# PRD: Berra's Yatzy Web Game

## Overview
A simple, playable Yatzy (Yahtzee) dice game that runs in the browser. Single player, clean UI, no backend required.

## Problem Statement
We need a fun, functional demo project to test our development workflow. Yatzy is a classic dice game with clear rules — perfect for a contained project.

## Target Users
Anyone who wants to play Yatzy in their browser.

## Goals & Success Metrics
- Fully playable Yatzy game
- Works in modern browsers
- Clean, intuitive UI
- No external dependencies (vanilla JS or minimal framework)

## User Stories

### US-001: Project Setup
**As a** developer
**I want to** have a basic project structure with HTML, CSS, and JS
**So that** I can build the game

**Acceptance Criteria:**
- [ ] index.html with basic structure
- [ ] styles.css with basic styling
- [ ] game.js with module structure
- [ ] Game title and container visible

**Priority:** High
**Estimate:** S

### US-002: Dice Display
**As a** player
**I want to** see 5 dice on the screen
**So that** I can play the game

**Acceptance Criteria:**
- [ ] 5 dice rendered visually (showing dots or numbers)
- [ ] Dice are clearly visible and styled
- [ ] Each die shows a value 1-6

**Priority:** High
**Estimate:** S

### US-003: Roll Dice
**As a** player  
**I want to** roll the dice
**So that** I can get random values

**Acceptance Criteria:**
- [ ] "Roll" button visible
- [ ] Clicking roll randomizes all unheld dice
- [ ] Visual feedback on roll (animation optional)
- [ ] Maximum 3 rolls per turn

**Priority:** High
**Estimate:** M

### US-004: Hold Dice
**As a** player
**I want to** hold/unhold individual dice
**So that** I can keep good rolls

**Acceptance Criteria:**
- [ ] Clicking a die toggles hold state
- [ ] Held dice visually distinct (highlighted/bordered)
- [ ] Held dice don't change on roll
- [ ] Can toggle hold on/off

**Priority:** High
**Estimate:** S

### US-005: Scorecard Display
**As a** player
**I want to** see the Yatzy scorecard
**So that** I can track my score

**Acceptance Criteria:**
- [ ] All 13 Yatzy categories displayed
- [ ] Upper section: Ones through Sixes
- [ ] Lower section: Three of a Kind, Four of a Kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
- [ ] Shows potential score for each unfilled category
- [ ] Shows locked scores for filled categories

**Priority:** High
**Estimate:** M

### US-006: Score Selection
**As a** player
**I want to** select a category to score
**So that** I can complete my turn

**Acceptance Criteria:**
- [ ] Clicking an available category scores it
- [ ] Score is calculated correctly per Yatzy rules
- [ ] Category becomes locked after scoring
- [ ] Turn resets (rolls reset to 3, dice unheld)

**Priority:** High
**Estimate:** M

### US-007: Score Calculation
**As a** player
**I want to** scores calculated correctly
**So that** the game is fair

**Acceptance Criteria:**
- [ ] Upper section: sum of matching dice
- [ ] Three/Four of a Kind: sum of all dice if valid
- [ ] Full House: 25 points if valid
- [ ] Small Straight: 30 points if valid
- [ ] Large Straight: 40 points if valid
- [ ] Yahtzee: 50 points if valid
- [ ] Chance: sum of all dice
- [ ] Upper bonus: 35 points if upper section >= 63

**Priority:** High
**Estimate:** M

### US-008: Game End
**As a** player
**I want to** see my final score when the game ends
**So that** I know how I did

**Acceptance Criteria:**
- [ ] Game detects when all 13 categories filled
- [ ] Final score displayed prominently
- [ ] "Play Again" button to restart

**Priority:** Medium
**Estimate:** S

## Technical Considerations
- Pure HTML/CSS/JS (no build step)
- Single page application
- Mobile-friendly responsive design
- No backend needed

## Out of Scope
- Multiplayer
- Score persistence/leaderboards
- Sound effects
- Complex animations

## Dependencies
None — standalone web app
