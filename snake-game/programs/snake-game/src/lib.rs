use anchor_lang::prelude::*;

declare_id!("13RUPAPTgSEHnvnVtPGXtD3wG8EXoLUkAuERLD96bSeB");

#[program]
pub mod snake_game {
    use super::*;

    pub fn initialize_monthly_game(ctx: Context<CreateMonthlyGame>, game_price: u64) -> Result<()> {
        let game: &mut Account<Game> = &mut ctx.accounts.game;
        game.authority = ctx.accounts.admin.key();
        game.winner = ctx.program_id.key();
        game.count = 0;
        game.winner_high_score = 30;
        game.game_price = game_price;

        Ok(())
    }

    pub fn submit_score(ctx: Context<SubmitScore>) -> Result<()> {
        let game: &mut Account<Game> = &mut ctx.accounts.game;
        let player: &mut Signer = &mut ctx.accounts.player;

        game.count += 1;

        let game_score: &mut Account<GameScore> = &mut ctx.accounts.game_score;
        game_score.submitter = player.key();
        game_score.index = game.count;
        game_score.score = 0;


        Ok(())
    }

    pub fn update_score(ctx: Context<UpdateScore>, score: u16) -> Result<()> {
        let game: &mut Account<Game> = &mut ctx.accounts.game;
        let game_score: &mut Account<GameScore> = &mut ctx.accounts.game_score;
        let player: &Signer = &ctx.accounts.player;

        require!(player.key() == game_score.submitter, CustomError::Unauthorized);


        if score > game.winner_high_score {
            game.winner_high_score = score;
        }
        game_score.score = score;

        Ok(())
    }

    pub fn new_high_score(ctx: Context<Payout>) -> Result<()> {
        let game: &mut Account<Game> = &mut ctx.accounts.game;
        let recipient: &mut AccountInfo = &mut ctx.accounts.winner;

        require!(game.winner == *recipient.key, CustomError::InvalidRecipient);

        let balance: u64 = game.to_account_info().lamports() / 10;

        **game.to_account_info().try_borrow_mut_lamports()? -= balance;
        **recipient.to_account_info().try_borrow_mut_lamports()? += balance;

        Ok(())
    }
}



#[derive(Accounts)]
pub struct CreateMonthlyGame<'info> {
    #[account(init, payer = admin, space = 8 + 100)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(init, 
        seeds = [
            &game.count.to_be_bytes(), 
            game.key().as_ref()
            ],
        bump, 
        payer = player,
        space = 8 + GameScore::INIT_SPACE
    )]
    pub game_score: Account<'info, GameScore>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub game_score: Account<'info, GameScore>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(mut,
        constraint = game_score.submitter == *winner.key &&
        game.winner_high_score == game_score.score)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    /// CHECK:
    pub winner: AccountInfo<'info>,
    #[account(mut)]
    pub game_score: Account<'info, GameScore>

}

#[account]
pub struct Game {
    pub authority: Pubkey,
    pub winner: Pubkey,
    pub winner_high_score: u16,
    pub count: u64,
    pub game_price: u64,
}

#[account]
#[derive(InitSpace)]
pub struct GameScore {
    pub submitter: Pubkey,
    pub index: u64,
    pub score: u16,
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized attempt to update score.")]
    Unauthorized,
    #[msg("Invalid recipient for payout.")]
    InvalidRecipient,
}