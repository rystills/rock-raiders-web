# Rock Raiders Web
Rock Raiders Web is an experiment aimed at recreating Rock Raiders PC game (1999) using browser based technologies.

**Enjoy!**

## Screenshots
<a href="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2001.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2001.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2002.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2002.png?raw=true" width="360" alt="Screenshot">
</a>

<a href="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2003.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2003.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2004.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/test/screenshots/2021-04-02%2004.png?raw=true" width="360" alt="Screenshot">
</a>

## Development Roadmap

### Near
- Carry energy crystals primarily to power stations
- Electric fences and power consumption/outage
- Air consumption and production
- Bricks and brick refinery
- Actual building and more training options

### Mid
- Damage and show health bar
- Teleport up on demand or at bad health
- Vehicles
- Raider commands (board, pickup, drop, grab...)
- Radar map and Geologists
- Alarm mode and shooting

### Far
- Rock-Monsters and Slugs
- Sounds and music
- Level score shown and level unlocking
- Save and load
- First-Person and shoulder camera
- Tutorial levels

## Known Bugs

### Important
- make game pausable and actually pause in escape screen (also fixes elapsed game time)
- GunStation mesh not loaded correctly missing "head" part

### Nice to have
- Requirements tooltip for buildings/vehicles not shown
- When scene is disposed animation interval must be canceled
- Camera can glitch through terrain and zoom in/out infinitely
- Scene should be rendered in its own worker (thread)
- Teleport In animation for buildings at level start missing

### Cosmetics
- No tooltips
- Cursor does not react on targeted object
- Loading screen does not resize with window
- Power paths not rotated correctly to nearby buildings

## Technical Debt

- refactor terrain height handling
-- introduce methode to determine terrain height, without ray intersection
-- provide option to determine location "on" the terrain by x and z coordinate

## Development
To start development environment, please take the following steps:

```bash
git clone https://github.com/scarabol/rock-raiders-web.git
cd rock-raiders-web
npm install
npm run dev
```
