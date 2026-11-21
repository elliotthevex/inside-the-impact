#!/usr/bin/env python3
"""Reset a corner's password by hand. There is no email reset, so this is
what "Ask the game's makers to reset it" on the Corner Pass means.

  python3 -I tools/accounts/reset_password.py CORNER_NAME

Prints a new temporary password and the SQL that sets it. Run the SQL in
the Cloudflare dashboard (D1 > your database > Console), then give the
player the temporary password in person and ask them to make a new corner
or keep it. The SQL also signs the corner out everywhere and clears its
failed-try counters. Nothing is sent anywhere by this script.

The hash matches functions/api/[[route]].js: PBKDF2-SHA256, 16-byte salt,
the password NFC-normalised, stored as pbkdf2-sha256$ITER$SALT$HASH."""
import base64, hashlib, os, re, secrets, sys, unicodedata

ITER = 100000

if len(sys.argv) != 2 or not re.fullmatch(r"[A-Za-z0-9_]{3,16}", sys.argv[1]):
    sys.exit("usage: reset_password.py CORNER_NAME   (3-16 letters, numbers or _)")
key = sys.argv[1].lower()
pw = "-".join(secrets.token_hex(3) for _ in range(3))
salt = os.urandom(16)
h = hashlib.pbkdf2_hmac("sha256", unicodedata.normalize("NFC", pw).encode(), salt, ITER, 32)
stored = f"pbkdf2-sha256${ITER}${base64.b64encode(salt).decode()}${base64.b64encode(h).decode()}"
print(f"Temporary password for {sys.argv[1]}: {pw}\n")
print("SQL for the D1 console:\n")
print(f"UPDATE corners SET pw = '{stored}' WHERE name_key = '{key}';")
print(f"DELETE FROM sessions WHERE corner_id = (SELECT id FROM corners WHERE name_key = '{key}');")
print(f"DELETE FROM tries WHERE k = 'in:{key}' OR k LIKE 'in:{key}:%';")
