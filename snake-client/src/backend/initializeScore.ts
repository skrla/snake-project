import {
    BlockheightBasedTransactionConfirmationStrategy,
    Keypair,
    LAMPORTS_PER_SOL,
    SendTransactionError,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Program, web3, getProvider } from '@coral-xyz/anchor';
import { SnakeGame } from '../types/snake_game';
import { Buffer } from 'buffer';
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

export const initializeScore = async (connection: web3.Connection, wallet: AnchorWallet): Promise<boolean> => {
    const game = getKeypairFromEnvironment('REACT_APP_SNAKE_GAME');

    const program = new Program<SnakeGame>(jsonIdl, getProvider());

    let gameState = await program.account.game.fetch(game.publicKey);
    const buf1 = Buffer.alloc(8);
    buf1.writeBigUInt64BE(BigInt(gameState.count.toString()), 0);

    const [submission, bump] = await web3.PublicKey.findProgramAddressSync(
        [buf1, game.publicKey.toBytes()],
        program.programId
    );

    try {
        const transaction = new Transaction();
        const submitScore = await program.methods
            .submitScore()
            .accountsStrict({
                game: game.publicKey,
                player: wallet.publicKey,
                systemProgram: SystemProgram.programId,
                gameScore: submission,
            })
            .instruction();
        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: game.publicKey,
            lamports: LAMPORTS_PER_SOL * 0.01,
        });
        const latestBlockHash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockHash.blockhash;

        transaction.feePayer = wallet.publicKey;

        transaction.add(submitScore);
        transaction.add(sendSolInstruction);
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: false });

        const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
            blockhash: transaction.recentBlockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        };
        await connection.confirmTransaction(confirmStrategy);
        console.log('Transaction successful with signature:', signature);
        return true;
    } catch (error: any) {
        toast.error('Unsuccessful attempt for starting the game!');
        return false;
    }
};
