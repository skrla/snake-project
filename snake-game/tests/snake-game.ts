import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SnakeGame } from "../target/types/snake_game";
import { expect } from "chai";

describe("snake-game", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(anchor.AnchorProvider.local());

  const LAMPORTS_PER_SOL = 1000000000;

  const LAMPORTS_PER_GAME = 10000000;

  const game = anchor.web3.Keypair.generate();
  const gameAdmin = anchor.web3.Keypair.generate();
  const player1 = anchor.web3.Keypair.generate();
  const player2 = anchor.web3.Keypair.generate();
  const player3 = anchor.web3.Keypair.generate();

  const program = anchor.workspace.SnakeGame as Program<SnakeGame>;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player1.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player2.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player3.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        gameAdmin.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
  });

  it("Initializing monthly game!", async () => {
    // Add your test here.
    console.log("game pubkey", game.publicKey.toString());
    console.log(LAMPORTS_PER_GAME);
    const tx = await program.methods
      .initializeMonthlyGame(new anchor.BN(LAMPORTS_PER_GAME))
      .accounts({
        game: game.publicKey,
        admin: gameAdmin.publicKey,
      })
      .signers([game, gameAdmin])
      .rpc();

    const gameState = await program.account.game.fetch(game.publicKey);
    expect(gameState.count.toNumber()).to.equal(0);
    expect(gameState.winnerHighScore).to.equal(30);

    expect(gameState.authority.toString()).to.equal(
      gameAdmin.publicKey.toString()
    );

    expect(gameState.gamePrice.toNumber()).to.equal(LAMPORTS_PER_GAME);
    console.log("Your transaction signature", tx);
  });

  it("Initializing game score as player1", async () => {
    let gameScoreId: number = (
      await program.account.game.fetch(game.publicKey)
    ).count.toNumber();

    const buf1 = Buffer.alloc(8);
    buf1.writeBigUInt64BE(BigInt(gameScoreId.toString()), 0);

    const [submission, bump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [buf1, game.publicKey.toBytes()],
        program.programId
      );

    await program.methods
      .submitScore()
      .accounts({
        game: game.publicKey,
        player: player1.publicKey,
      })
      .signers([player1])
      .rpc();

    let gameState = await program.account.game.fetch(game.publicKey);

    expect(gameState.count.toNumber()).to.equal(gameScoreId + 1);

    let submissionState = await program.account.gameScore.fetch(submission);

    expect(submissionState.submitter.toString()).to.equal(
      player1.publicKey.toString()
    );

    expect(submissionState.score).to.equal(0);
  });

  it("Submits score as player1", async () => {
    let gameScoreId: number = (
      await program.account.game.fetch(game.publicKey)
    ).count.toNumber();

    const buf1 = Buffer.alloc(8);
    buf1.writeBigUInt64BE(BigInt((gameScoreId - 1).toString()), 0);

    const [submission, bump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [buf1, game.publicKey.toBytes()],
        program.programId
      );

    const score = 31;
    let gameState = await program.account.game.fetch(game.publicKey);
    await program.methods
      .updateScore(score)
      .accounts({
        game: game.publicKey,
        gameScore: submission,
        player: player1.publicKey,
      })
      .signers([player1])
      .rpc();

    gameState = await program.account.game.fetch(game.publicKey);

    let submissionState = await program.account.gameScore.fetch(submission);

    expect(submissionState.submitter.toString()).to.equal(
      player1.publicKey.toString()
    );

    expect(submissionState.score).to.equal(31);
  });

  it("New high score", async () => {
    let startBalancePlayer: number = await provider.connection.getBalance(
      player1.publicKey
    );
    let startBalanceGame: number = await provider.connection.getBalance(
      game.publicKey
    );

    let gameScoreId: number = (
      await program.account.game.fetch(game.publicKey)
    ).count.toNumber();

    const buf1 = Buffer.alloc(8);
    buf1.writeBigUInt64BE(BigInt((gameScoreId - 1).toString()), 0);

    const [submission, bump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [buf1, game.publicKey.toBytes()],
        program.programId
      );

    let gameState = await program.account.game.fetch(game.publicKey);
    await program.methods
      .newHighScore()
      .accounts({
        game: game.publicKey,
        winner: player1.publicKey,
        gameScore: submission,
      })
      .rpc();

    let endBalanacePlayer: number = await provider.connection.getBalance(
      player1.publicKey
    );

    let endBalanceGame: number = await provider.connection.getBalance(
      game.publicKey
    );

    gameState = await program.account.game.fetch(game.publicKey);

    console.log(startBalanceGame);
    console.log(endBalanceGame);

    console.log(startBalancePlayer);
    console.log(endBalanacePlayer);
    expect(endBalanceGame).to.be.lessThan(startBalanceGame);

    expect(startBalancePlayer).to.be.lessThan(endBalanacePlayer);

    expect(gameState.count.toNumber()).to.equal(gameScoreId);

    expect(gameState.winnerHighScore).to.equal(31);

    let submissionState = await program.account.gameScore.fetch(submission);

    expect(submissionState.submitter.toString()).to.equal(
      player1.publicKey.toString()
    );
  });
});
