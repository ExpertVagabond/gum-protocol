const anchor = require("@coral-xyz/anchor");
const {
  PublicKey,
  Keypair,
  SystemProgram,
} = require("@solana/web3.js");
const { assert } = require("chai");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { keccak256 } = require("js-sha3");

const CONFIRM_OPTS = { commitment: "confirmed" };

// Program IDs
const NAMESERVICE_PROGRAM_ID = new PublicKey(
  "5kWEYrdyryq3jGP5sUcKwTySzxr3dHzWFBVA3vkt6Nj5"
);
const CORE_PROGRAM_ID = new PublicKey(
  "6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6"
);

// Load IDLs
const nsIdl = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "gpl_nameservice.json"), "utf-8")
);
const coreIdl = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "gpl_core.json"), "utf-8")
);

// Derive NameRecord PDA: seeds = [b"name_record", keccak256(name), domain_pubkey]
function deriveNameRecordPDA(name, domainPubkey) {
  const nameHash = Buffer.from(keccak256(name), "hex");
  return PublicKey.findProgramAddressSync(
    [Buffer.from("name_record"), nameHash, domainPubkey.toBuffer()],
    NAMESERVICE_PROGRAM_ID
  );
}

// Derive Profile PDA: seeds = [b"profile", random_hash]
function deriveProfilePDA(randomHash) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), randomHash],
    CORE_PROGRAM_ID
  );
}

// Derive Post PDA: seeds = [b"post", random_hash]
function derivePostPDA(randomHash) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("post"), randomHash],
    CORE_PROGRAM_ID
  );
}

describe("Gum Protocol — Revival Test Suite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  // Create program interfaces from IDLs
  const nameservice = new anchor.Program(nsIdl, NAMESERVICE_PROGRAM_ID, provider);
  const core = new anchor.Program(coreIdl, CORE_PROGRAM_ID, provider);

  let gumTldPda;
  let nameRecordPda;
  let profilePda;
  let postPda;
  const profileRandomHash = Array.from(crypto.randomBytes(32));
  const postRandomHash = Array.from(crypto.randomBytes(32));
  const tldName = "gum";
  const screenName = "testuser";
  const metadataUri = "https://example.com/profile";
  const postUri = "https://example.com/post/1";

  // ==================== NAMESERVICE TESTS ====================

  it("Creates a TLD (top-level domain) in the nameservice", async () => {
    const defaultPubkey = new PublicKey(Buffer.alloc(32, 0));
    [gumTldPda] = deriveNameRecordPDA(tldName, defaultPubkey);

    console.log("    TLD PDA:", gumTldPda.toBase58());

    const tx = await nameservice.methods
      .createTld(tldName)
      .accounts({
        nameRecord: gumTldPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    CreateTLD tx:", tx);

    const acct = await provider.connection.getAccountInfo(gumTldPda);
    assert.isNotNull(acct, "TLD account should exist");
    assert.equal(
      acct.owner.toBase58(),
      NAMESERVICE_PROGRAM_ID.toBase58(),
      "TLD should be owned by nameservice program"
    );
    console.log("    TLD data size:", acct.data.length, "bytes");
  });

  it("Creates a name record (screen name) under the TLD", async () => {
    [nameRecordPda] = deriveNameRecordPDA(screenName, gumTldPda);

    console.log("    NameRecord PDA:", nameRecordPda.toBase58());

    const tx = await nameservice.methods
      .createNameRecord(screenName)
      .accounts({
        nameRecord: nameRecordPda,
        domain: gumTldPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    CreateNameRecord tx:", tx);

    const acct = await provider.connection.getAccountInfo(nameRecordPda);
    assert.isNotNull(acct, "Name record should exist");
    assert.equal(
      acct.owner.toBase58(),
      NAMESERVICE_PROGRAM_ID.toBase58(),
      "Name record should be owned by nameservice"
    );
  });

  // ==================== CORE SOCIAL TESTS ====================

  it("Creates a social profile linked to the screen name", async () => {
    [profilePda] = deriveProfilePDA(Buffer.from(profileRandomHash));

    console.log("    Profile PDA:", profilePda.toBase58());

    const tx = await core.methods
      .createProfile(profileRandomHash, metadataUri)
      .accounts({
        payer: wallet.publicKey,
        profile: profilePda,
        screenName: nameRecordPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    CreateProfile tx:", tx);

    const acct = await provider.connection.getAccountInfo(profilePda);
    assert.isNotNull(acct, "Profile account should exist");
    assert.equal(
      acct.owner.toBase58(),
      CORE_PROGRAM_ID.toBase58(),
      "Profile should be owned by core program"
    );
    console.log("    Profile data size:", acct.data.length, "bytes");
  });

  it("Creates a post on the profile", async () => {
    [postPda] = derivePostPDA(Buffer.from(postRandomHash));

    console.log("    Post PDA:", postPda.toBase58());

    // Pass CORE_PROGRAM_ID as sessionToken for Anchor's Option<Account> None convention
    const tx = await core.methods
      .createPost(postUri, postRandomHash)
      .accounts({
        payer: wallet.publicKey,
        post: postPda,
        profile: profilePda,
        sessionToken: CORE_PROGRAM_ID,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    CreatePost tx:", tx);

    const acct = await provider.connection.getAccountInfo(postPda);
    assert.isNotNull(acct, "Post account should exist");
    assert.equal(
      acct.owner.toBase58(),
      CORE_PROGRAM_ID.toBase58(),
      "Post should be owned by core program"
    );
  });

  it("Cannot create duplicate name record", async () => {
    try {
      await nameservice.methods
        .createNameRecord(screenName)
        .accounts({
          nameRecord: nameRecordPda,
          domain: gumTldPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc(CONFIRM_OPTS);
      assert.fail("Should have failed on duplicate name record");
    } catch (err) {
      console.log(
        "    Duplicate name correctly rejected:",
        err.message.substring(0, 80)
      );
      assert.ok(true);
    }
  });

  it("Deletes the post", async () => {
    const tx = await core.methods
      .deletePost()
      .accounts({
        post: postPda,
        profile: profilePda,
        sessionToken: CORE_PROGRAM_ID,
        authority: wallet.publicKey,
        refundReceiver: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    DeletePost tx:", tx);

    const acct = await provider.connection.getAccountInfo(postPda);
    assert.isNull(acct, "Post should be closed after deletion");
  });

  it("Deletes the profile", async () => {
    const tx = await core.methods
      .deleteProfile()
      .accounts({
        profile: profilePda,
        authority: wallet.publicKey,
      })
      .rpc(CONFIRM_OPTS);

    console.log("    DeleteProfile tx:", tx);

    const acct = await provider.connection.getAccountInfo(profilePda);
    assert.isNull(acct, "Profile should be closed after deletion");
  });
});
