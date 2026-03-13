# gum-protocol

**On-chain social media protocol for Solana. Create profiles, publish posts, and manage social connections — all stored on-chain via Anchor programs.**

![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Revival of the Gum Protocol. Originally built by gumhq, preserved and maintained for the Graveyard Hackathon.

## Programs

- **gpl_core** — Profile and post management
- **gpl_nameservice** — On-chain username resolution
- **gpl_session** — Session key management with macros

## Features

- On-chain user profiles with metadata
- Post creation and content storage
- Social graph (follow/unfollow connections)
- Session keys for gasless UX
- Name service for human-readable usernames

## Build

```bash
anchor build
anchor test
```

## Original

Forked from [gumhq/gum](https://github.com/gumhq/gum).

## License

[MIT](LICENSE)

## Author

Maintained by [Purple Squirrel Media](https://purplesquirrelmedia.io)
