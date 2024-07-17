import {
    Keypair,
    PublicKey,
    SendTransactionError,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, setProvider } from '@coral-xyz/anchor';
import { SnakeGame } from '../types/snake_game';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
const idl = require('../idl.json');

const stringflayedIdl = JSON.stringify(idl);
const jsonIdl = JSON.parse(stringflayedIdl);

const getKeypairFromEnvironment = (envVar: string): Keypair => {
    const secretKeyString = process.env[envVar] || '';

    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

export const initializeGame = async (
    connection: web3.Connection,
    wallet: AnchorWallet,
    setRecord: React.Dispatch<React.SetStateAction<number>>
) => {
    const gameAdmin = getKeypairFromEnvironment('REACT_APP_SNAKE_CLIENT');
    const game = getKeypairFromEnvironment('REACT_APP_SNAKE_GAME');

    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);

    const program = new Program<SnakeGame>(jsonIdl, provider);
    let gameState = null;

    try {
        gameState = await program.account.game.fetch(game.publicKey);
        setRecord(gameState.winnerHighScore);
    } catch (error) {}
    if (!gameState) {
        try {
            await program.methods
                .initializeMonthlyGame(new BN(0.01 * web3.LAMPORTS_PER_SOL))
                .accounts({ game: game.publicKey, admin: gameAdmin.publicKey })
                .signers([game, gameAdmin])
                .rpc();
            gameState = await program.account.game.fetch(game.publicKey);
            setRecord(gameState.winnerHighScore | 0);
        } catch (error) {
            console.log("Can't connect with Blockchain!");
        }
    }
};
