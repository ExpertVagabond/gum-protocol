use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("6MhUAJtKdJx3RDCffUsJsQm8xy9YhhywjEmMYrxRc5j6");
#[cfg(not(feature = "no-entrypoint"))]
solana_security_txt::security_txt! {
    name: "gpl_core",
    project_url: "https://gum.fun",
    contacts: "email:hello@gum.fun,twitter:@gumisfunn",
    policy: "",
    preferred_languages: "en",
    source_code: "https://github.com/gumhq/gpl"
}

// ---- Security: input validation ----
/// Maximum metadata URI length (prevents excessive on-chain storage).
const MAX_URI_LENGTH: usize = 256;
/// Maximum reaction type length.
const MAX_REACTION_LENGTH: usize = 64;

/// Validate a metadata URI is within bounds and contains no control characters.
fn validate_uri(uri: &str) -> Result<()> {
    require!(
        !uri.is_empty() && uri.len() <= MAX_URI_LENGTH,
        errors::GumError::URITooLong
    );
    require!(
        !uri.bytes().any(|b| b < 0x20 && b != b'\t'),
        errors::GumError::URITooLong
    );
    Ok(())
}

/// Validate a reaction type string.
fn validate_reaction(reaction_type: &str) -> Result<()> {
    require!(
        !reaction_type.is_empty() && reaction_type.len() <= MAX_REACTION_LENGTH,
        errors::GumError::ReactionTypeTooLong
    );
    // Reject control characters in reaction strings
    require!(
        !reaction_type.bytes().any(|b| b < 0x20 && b != b'\t'),
        errors::GumError::ReactionTypeTooLong
    );
    Ok(())
}

/// Sanitize error output for external consumption — strip internal details.
fn sanitize_error_msg(msg: &str) -> String {
    msg.lines().next().unwrap_or("Unknown error").chars().take(200).collect()
}

/// Validate a random hash is not all zeros (prevents deterministic collisions).
fn validate_random_hash(hash: &[u8; 32]) -> Result<()> {
    require!(
        hash.iter().any(|&b| b != 0),
        errors::GumError::UnauthorizedSigner
    );
    Ok(())
}

#[program]
pub mod gpl_core {

    use super::*;

    // Create a new profile account
    pub fn create_profile(
        ctx: Context<CreateProfile>,
        random_hash: [u8; 32],
        metadata_uri: String,
    ) -> Result<()> {
        validate_random_hash(&random_hash)?;
        validate_uri(&metadata_uri)?;
        create_profile_handler(ctx, random_hash, metadata_uri)
    }

    // update a profile account
    pub fn update_profile(ctx: Context<UpdateProfile>, metadata_uri: String) -> Result<()> {
        validate_uri(&metadata_uri)?;
        update_profile_handler(ctx, metadata_uri)
    }

    // Delete a profile account
    pub fn delete_profile(ctx: Context<DeleteProfile>) -> Result<()> {
        delete_profile_handler(ctx)
    }

    // create a new post account
    pub fn create_post(
        ctx: Context<CreatePost>,
        metadata_uri: String,
        random_hash: [u8; 32],
    ) -> Result<()> {
        validate_random_hash(&random_hash)?;
        validate_uri(&metadata_uri)?;
        create_post_handler(ctx, metadata_uri, random_hash)
    }

    // update a post
    pub fn update_post(ctx: Context<UpdatePost>, metadata_uri: String) -> Result<()> {
        validate_uri(&metadata_uri)?;
        update_post_handler(ctx, metadata_uri)
    }

    // create a comment
    pub fn create_comment(
        ctx: Context<CreateComment>,
        metadata_uri: String,
        random_hash: [u8; 32],
    ) -> Result<()> {
        validate_random_hash(&random_hash)?;
        validate_uri(&metadata_uri)?;
        create_comment_handler(ctx, metadata_uri, random_hash)
    }

    // delete a post
    pub fn delete_post(ctx: Context<DeletePost>) -> Result<()> {
        delete_post_handler(ctx)
    }

    // create a connection account
    pub fn create_connection(ctx: Context<CreateConnection>) -> Result<()> {
        create_connection_handler(ctx)
    }

    // delete a connection account
    pub fn delete_connection(ctx: Context<DeleteConnection>) -> Result<()> {
        delete_connection_handler(ctx)
    }

    // create a reaction account with reaction type
    pub fn create_reaction(ctx: Context<CreateReaction>, reaction_type: String) -> Result<()> {
        validate_reaction(&reaction_type)?;
        create_reaction_handler(ctx, reaction_type)
    }

    // delete a reaction account
    pub fn delete_reaction(ctx: Context<DeleteReaction>) -> Result<()> {
        delete_reaction_handler(ctx)
    }

    // create a badge account
    pub fn create_badge(ctx: Context<CreateBadge>, metadata_uri: String) -> Result<()> {
        validate_uri(&metadata_uri)?;
        create_badge_handler(ctx, metadata_uri)
    }

    // update a badge
    pub fn update_badge(ctx: Context<UpdateBadge>, metadata_uri: String) -> Result<()> {
        validate_uri(&metadata_uri)?;
        update_badge_handler(ctx, metadata_uri)
    }

    // burn a badge
    pub fn burn_badge(ctx: Context<BurnBadge>) -> Result<()> {
        burn_badge_handler(ctx)
    }

    // create an issuer account
    pub fn create_issuer(ctx: Context<CreateIssuer>) -> Result<()> {
        create_issuer_handler(ctx)
    }

    // verify an issuer
    pub fn verify_issuer(ctx: Context<VerifyIssuer>) -> Result<()> {
        verify_issuer_handler(ctx)
    }

    // delete an issuer
    pub fn delete_issuer(ctx: Context<DeleteIssuer>) -> Result<()> {
        delete_issuer_handler(ctx)
    }

    // create a schema account
    pub fn create_schema(
        ctx: Context<CreateSchema>,
        metadata_uri: String,
        random_hash: [u8; 32],
    ) -> Result<()> {
        validate_random_hash(&random_hash)?;
        validate_uri(&metadata_uri)?;
        create_schema_handler(ctx, metadata_uri, random_hash)
    }

    // update a schema
    pub fn update_schema(ctx: Context<UpdateSchema>, metadata_uri: String) -> Result<()> {
        validate_uri(&metadata_uri)?;
        update_schema_handler(ctx, metadata_uri)
    }

    // delete a schema
    pub fn delete_schema(ctx: Context<DeleteSchema>) -> Result<()> {
        delete_schema_handler(ctx)
    }
}
