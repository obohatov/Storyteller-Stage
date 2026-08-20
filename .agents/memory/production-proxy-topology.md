---
name: Production proxy topology
description: Measured Replit production forwarding chain and the safe Express trust boundary for IP-based limiting.
---

Production forwarding must use exactly four trusted proxy hops. The true client address is the fourth address from the right after the app socket; any earlier `X-Forwarded-For` values are caller-controlled prefixes and must not affect rate-limit identity.

**Why:** A short-lived, token-gated production diagnostic returned only HMAC fingerprints. It confirmed that rotating caller-supplied prefixes were prepended, while the platform-added client fingerprint remained at the measured boundary. The old one-hop setting selected a rotating intermediary instead.

**How to apply:** Keep the four-hop setting limited to production. If the deployment topology changes, repeat a privacy-safe controlled production measurement before altering the value; do not infer it from generic proxy assumptions or use `X-Real-IP`.