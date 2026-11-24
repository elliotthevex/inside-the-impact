# Corner Pass accounts: setup and checks

The login screen (the Corner Pass) talks to `functions/api/[[route]].js`, a
Cloudflare Pages Function. Pages runs it for every request under `/api/`;
the rest of the site stays static.

Until a database is attached, `/api/me` answers `{"accounts":false}` and the
Corner Pass offers **Train as a guest** only, with no sign-in fields. The
GitHub Pages copy has no `/api` at all and behaves the same way. So the code
can go live before accounts are switched on, and nothing on screen promises
a sign-in that cannot work.

## Switching accounts on (Cloudflare dashboard, about five minutes)

1. **Storage & Databases → D1 → Create database.** Name it, for example,
   `iti-corners`. The free plan is enough.
2. **Workers & Pages → inside-the-impact → Settings → Bindings → Add →
   D1 database.** Variable name `DB` (exactly), database `iti-corners`.
   Add it for Production. Add it for Preview too if you want previews to
   have accounts (they would share the same database unless you make a
   second one).
3. **Settings → Variables and Secrets → Add**, type Secret, name
   `IP_SALT`, value any long random string. The API stores a hash of each
   visitor's network address for rate limiting. Without the secret the
   salt is the public default in the code, and anyone holding the database
   could work the addresses back out by trying them all.
4. **Redeploy.** Bindings only reach new deployments: push the next commit
   to `main`, or use Deployments → Retry deployment on the latest one.
5. Check: `https://inside-the-impact.pages.dev/api/me` should answer
   `{"accounts":true,"corner":null}`. Then make one test corner on the site,
   sign out, sign back in, and delete it from the signed-in card.

The tables are created on the first request (`CREATE TABLE IF NOT EXISTS`).
`schema.sql` beside this file holds the same statements if you would rather
run them in the D1 console first.

### Watch on the first real sign-in

Passwords are hashed with PBKDF2-SHA256 at 100,000 rounds, the most the
Workers runtime allows. On the **Workers Free plan** each request gets 10 ms
of CPU, and hashing costs about that much, so it has not been tried there.
If signing in or making a corner fails with Cloudflare error 1102
("exceeded resource limits"), add a variable `PW_ITER` = `50000` and
redeploy. Each stored hash carries its own round count, so existing
corners keep working; corners made at 100,000 rounds would still cost
100,000 to check, so test this before many people sign up.

## What is stored

| Table | What | Kept |
|---|---|---|
| `corners` | corner name, a lower-case copy for lookups, the password hash (PBKDF2, random salt), the game save as JSON (the same data the game keeps in `localStorage` under `iti.profile.v2`), a revision number, timestamps | until the player deletes the corner |
| `sessions` | SHA-256 of each sign-in token, the corner, expiry | 12 hours, or 30 days with "Keep me signed in"; expired rows are cleared on sign-in |
| `tries` | failed sign-in counters keyed by corner name and a hash of the network address | a day after the last miss |

No email, no real name, no IP address in clear. Settings (text size,
sound, keys) stay on each computer and are not uploaded.

## How the limits work

- Every try is counted before the password is checked, in one database
  statement, so a burst of parallel guesses is counted in full.
- Five wrong passwords for one corner from one network: a 60-second pause,
  doubling on each repeat up to an hour. The card counts the tries down
  ("4 tries left") and shows the pause as a timer.
- Fifty misses for one corner from anywhere in an hour: 15-minute pause.
- 600 sign-in tries from one network in 15 minutes: a pause of 1 to 5
  minutes. High and short on purpose: a whole school can share one address,
  and one student with a script must not lock everyone else out for long.
- 200 new corners per network per hour. Name checks: 600 per 10 minutes.
- Writes must come from the game's own page (`Origin` check) and be JSON.
- A save is only accepted as game numbers (counts, levels, flags, nested
  a few levels). Markup in a save is refused, and the game turns its
  counts back into plain numbers when it loads one.

## Forgot password

There is no email, so there is no self-service reset. The card says so and
tells the player to ask the game's makers. To reset one:

```sh
python3 -I tools/accounts/reset_password.py CORNER_NAME
```

It prints a temporary password and three SQL lines. Run them in
D1 → `iti-corners` → Console, then give the player the password in person.

To remove a corner by hand: `DELETE FROM sessions WHERE corner_id = (SELECT id FROM corners WHERE name_key = 'name'); DELETE FROM corners WHERE name_key = 'name';`
(Players can also delete their own corner from the signed-in card.)

## Testing on this computer

No Node or Wrangler needed.

```sh
python3 -I tools/accounts/devserver.py            # http://127.0.0.1:8797/
python3 -I tools/accounts/devserver.py --no-db    # as the live site before step 2
```

`devserver.py` serves the repo and runs the real function file inside a
muted headless Chrome (the same V8 engine and WebCrypto as Workers), with a
local SQLite file standing in for D1. It does not reproduce Cloudflare's CPU
limits or its HTTPS cookie handling.

```sh
python3 -I tools/accounts/e2e.py --shots /tmp/cp-shots
```

`e2e.py` starts its own server and database, then drives two muted headless
Chromes by keyboard and mouse through the whole flow: guest progress kept,
Tab order, new corner, saves reaching the server, reload, sign out, the
wrong-password countdown and pause, a second computer, Text Size, Reduced
Motion, the stacked layout, deleting a corner, and guest-only mode with no
database. It prints one line per check and saves screenshots.

## How the game keeps saves straight

- The game still plays from `localStorage` (`iti.profile.v2`), so nothing
  else in the game changed.
- Signed in, `iti.corner.v1` records whose save that is (`name`, `rev`,
  `dirty`). Each save goes up about 1.5 s later, and again when the tab is
  hidden or closed.
- Signing in to an existing corner puts the guest's own save aside in
  `iti.guest.v2`; signing out or deleting the corner brings it back.
- Making a new corner takes the guest's save into it.
- Each save says which revision it started from and which browser sent
  it. The server only takes it on top of that revision, or on top of the
  same browser's own later saves. If another computer saved in between,
  the server hands back the newer save, and the game loads it the next
  time the player is at the hub, with a short note saying so. Opening the
  game does the same check. So a computer left open on old progress can't
  overwrite newer progress made elsewhere.
- If a sign-out can't reach the server, the game remembers and sends it
  first the next time it opens on that computer.
- If two tabs are open and one signs a different corner in or out, the
  other stops saving and reloads.
- If the server can't be reached, a signed-in player can keep playing; the
  save goes up the next time they sign in.
