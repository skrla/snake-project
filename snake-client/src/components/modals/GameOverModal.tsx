import React, { useState } from 'react';
import ModalButton from './ModalButton';
import { Connection } from '@solana/web3.js';

type GameOverModalProps = {
    score: number;
    handleClose: React.Dispatch<React.SetStateAction<boolean>>;
    handlePlayAgain: () => void;
    closeModal: () => void;
    connection?: Connection;
};

const GameOverModal = ({ score, handlePlayAgain, handleClose, connection }: GameOverModalProps) => {
    const closeModal = () => {
        handleClose(true);
    };

    const playAgain = () => {
        handlePlayAgain();
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-screen h-screen bg-dark-500 opacity-65"></div>
            <div className="flex items-center justify-center fixed top-0 left-0 w-full h-full">
                <div className="bg-dark-600 border-dark-500 p-5 text-center rounded-xl shadow-2xl w-full max-w-[380px]">
                    <h2 className="text-green-500 text-xl">GAME OVER</h2>
                    <p className="text-white-500">Your Score: {score}</p>
                    <div className="max-w-[400px] w-full flex my-4 justify-center items-center gap-4">
                        <ModalButton text="Play Again" onClick={playAgain} />
                        <ModalButton text="Take screenshot" onClick={closeModal} secondary />
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameOverModal;
