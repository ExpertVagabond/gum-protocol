# Gum Protocol — Solana Graveyard Revival

> **Status: REVIVED** — 4 programs compile, nameservice + core deploy to localnet, 7/7 tests passing.
> Revived for the [Solana Graveyard Hackathon](https://solana.com/graveyard-hack) (Social track, Feb 2026).

## Revival Details

| Item | Value |
|------|-------|
| Programs | gpl_core, gpl_nameservice, gpl_session, gpl_compression |
| Framework | Anchor 0.28.0 (upgraded from 0.26) |
| Solana | solana-program 1.16.27 |
| Tests | 7/7 passing |
| Track | Social ($5,000) |

### What Was Fixed
- Upgraded Anchor from 0.26 to 0.28 for runtime compatibility with modern validators
- Upgraded solana-program from 1.14 to 1.16 (critical fix: 1.14 causes access violations on 1.18+ runtime)
- Updated gpl-session dependency from v0.2 to v2.0 (workspace path)
- Created JavaScript test suite covering full social lifecycle
- Created manual IDL files for gpl_nameservice and gpl_core

### Build & Test

```bash
# Build
export HOST_CC=/usr/bin/clang
anchor build --no-idl -p gpl_nameservice
anchor build --no-idl -p gpl_core

# Test (requires solana-test-validator)
cd revival-tests && npm install
solana-test-validator --reset \
  --bpf-program 5kWEYrdyryq3jGP5sUcKwTySzxr3dHzWFBVA3vkt6Nj5 ../target/deploy/gpl_nameservice.so \
  --bpf-program 6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6 ../target/deploy/gpl_core.so \
  --bpf-program 3ao63wcSRNa76bncC2M3KupNtXBFiDyNbgK52VG7dLaE ../target/deploy/gpl_session.so &
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 ANCHOR_WALLET=~/.config/solana/id.json \
  npx mocha gum.test.js --timeout 60000
```

### Tests
1. **Creates TLD** — Registers "gum" top-level domain in nameservice
2. **Creates name record** — Registers "testuser" screen name under TLD
3. **Creates profile** — Links profile to screen name with metadata URI
4. **Creates post** — Publishes content on the profile
5. **Duplicate rejection** — Verifies name uniqueness
6. **Deletes post** — Removes content, reclaims rent
7. **Deletes profile** — Closes profile account

---

_Original README:_

Gum, at its core, is a decentralized social media protocol on Solana. It unbundles traditional social media into Social Legos similar to how Defi unbundled traditional finance into Money Legos.

![Gum Social Legos](https://2840179994-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FhE7mGtqPpj3sUoePsT2p%2Fuploads%2FdPZGJ7tF8CQotSD0LIUK%2Flegos.e93068d9.svg?alt=media&token=7537963b-33a6-4e08-901f-d4c67f40586c)

All the individual legos like profiles, posts, connections and reactions are stored on-chain on Solana using Account Compression. Merkelizing the objects individually via account compression allows us to store an individual’s social data for life for the price of a pack of gum.

Application developers can compose with Gum to build these features for any consumer apps like they are chewing g̶l̶a̶s̶s̶ gum.

![Gum UI Components](https://2840179994-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FhE7mGtqPpj3sUoePsT2p%2Fuploads%2FTWtgAzkyStkoIO81sFpq%2FFrame%205.png?alt=media&token=f5c90475-7e57-4159-8002-1bddcb1da236)

# Why Gum?

Crypto has been around for a while, and the ecosystem has grown exponentially over the last few years. The industry is filled with a ton of exciting projects being built and even more builders working on them.

Yet, the meme of crypto still being an industry of ‘dog coins’ and ‘monkey pictures’ stays relevant. We’re still far away from gaining considerable adoption, let alone going mainstream. Instead, we need to actively think about where the next ‘billion users' are going to come from, and the answer to that question is, Consumer Apps.

Consumers want applications that are fun and engaging to use and application developers want their users to keep coming back to their apps and maintain high retention rates, this is the common denominator across any consumer application be it web2, web3, web5 or any other Fibonacci version of the web.

In addition, unlike the web2 networks, web3 networks are inherently open, i.e. open protocol, open state and open source, users can exit to another app without losing much. So, not only is it imperative to build fun, engaging and useful applications but also to identify what makes them tick and deliver differentiated value.

On the other hand, a wallet as a unique user identifier across all applications is very powerful, everything the user has done with the wallet since genesis is available for all applications to use, but very few do. Turns out, the infrastructure for this doesn’t exist or if it does, it is not productized and widely available yet.

Our thesis is that this is the key ingredient missing from most consumer applications and Gum is here to solve that.

Documentation: https://docs.gum.fun/

_NOTE_:

All the code and artificats in this repo are unaudited and is shared publicly in the true spirit of opensource. So there could potentially be bugs, if you do spot them. Please raise an issue or send a PR in the same spirit.
