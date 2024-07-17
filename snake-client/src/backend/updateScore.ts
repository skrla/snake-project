import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Program, web3, getProvider } from '@coral-xyz/anchor';
import { SnakeGame } from '../types/snake_game';
import { Buffer } from 'buffer';
import { ProgramAccount } from '@project-serum/anchor';
import { toast } from 'react-toastify';
window.Buffer = Buffer;
const idl = require('../idl.json');

const stringflayedIdl = JSON.stringify(idl);
const jsonIdl = JSON.parse(stringflayedIdl);

const getKeypairFromEnvironment = (envVar: string): Keypair => {
    const secretKeyString = process.env[envVar] || '';

    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

export const updateScore = async (connection: web3.Connection, wallet: AnchorWallet, score: number) => {
    const game = getKeypairFromEnvironment('REACT_APP_SNAKE_GAME');

    const program = new Program<SnakeGame>(jsonIdl, getProvider());

    let gameState = await program.account.game.fetch(game.publicKey);
    const buf1 = Buffer.alloc(8);
    buf1.writeBigUInt64BE(BigInt(gameState.count.toString()), 0);

    const gameScore = await program.account.gameScore.all();

    let gameScoreCurrent;

    for (let score of gameScore) {
        if (score.account.submitter.equals(wallet.publicKey) && score.account.score === 0) {
            gameScoreCurrent = score;
            break;
        }
    }

    try {
        if (!gameScoreCurrent) {
            return;
        }
        const submitScore = await program.methods
            .updateScore(score)
            .accounts({ game: game.publicKey, player: wallet.publicKey, gameScore: gameScoreCurrent.publicKey })
            .rpc();

        console.log('Transaction successful with signature:', submitScore);
    } catch (error: any) {
        toast.error('Unsuccessful attempt for updating the score!');
    }

    if (score > gameState.winnerHighScore) {
        if (gameScoreCurrent) {
            try {
                await program.methods
                    .newHighScore()
                    .accounts({
                        game: game.publicKey,
                        winner: wallet.publicKey,
                        gameScore: gameScoreCurrent?.publicKey,
                    })
                    .rpc();
                toast.success('YOU HAVE A NEW HIGH SCORE! 👑');
            } catch (error) {
                toast.error('Unsuccessful attempt for updating the high score!');
            }
        }
    }
};
