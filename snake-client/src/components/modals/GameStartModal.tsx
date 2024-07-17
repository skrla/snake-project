import React, { useState } from 'react';
import ModalButton from './ModalButton';
import Icon from '../Icon';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { initializeScore } from '../../backend/initializeScore';

type GameStartModalProps = {
    startGame: () => void;
    startGameTest: () => void;
};

const GameStartModal = ({ startGame, startGameTest }: GameStartModalProps) => {
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(3);
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const handleButtonTest = () => {
        startGameTest();
    };

    const handleButton = async () => {
        if (connection && wallet) {
            await initializeScore(connection, wallet);
        }
        setLoading(true);
        for (let i = timer; i > 0; i--) {
            setTimer(i);
            await delay(1000);
        }
        setLoading(false);
        startGame();
    };

    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-screen h-screen bg-dark-500 opacity-65"></div>
            <div className="flex items-center justify-center fixed top-0 left-0 w-full h-full z-10">
                <div className="flex flex-col items-center justify-center bg-white p-5 mx-5 text-center mt-10 rounded-lg w-[35%] min-w-96 max-w-[700px]">
                    <div className="flex flex-col py-6 max-w-[380px] w-full px-9 gap-3 text-white-500 bg-dark-600 rounded-md shadow-xlg">
                        <h2 className="text-2xl	font-semibold text-green-500">Play Blink Snake</h2>
                        {loading ? (
                            <>
                                <h3 className="text-lg text-center"> GAME STARTING IN:</h3>
                                <p className="text-6xl text-center font-bold">{timer}</p>
                            </>
                        ) : (
                            <>
                                <p className="flex flex-col gap-3 text-start text-white-500">
                                    Blink Snake is a game on the Solana blockchain. You can play it for SOL, and if you
                                    set a new record, you receive all the accumulated money from the game fees.
                                </p>
                                <hr />
                                <p className="flex flex-col gap-3 text-start text-white-500 mb-8">
                                    To play, use your arrow keys on your keyboard. Use arrow buttons if on mobile.
                                    <hr />
                                </p>
                                <p className="flex flex-col gap-3 text-center font-semibold text-white-500 text-lg">
                                    Connect Wallet To Play For Prizes
                                </p>
                                <ModalButton
                                    onClick={handleButton}
                                    text={`${connection && wallet ? 'Play Game For 0.01' : 'Connect Wallet'}`}
                                    className="flex justify-center items-center bg-purple-500"
                                    visible={connection && wallet ? true : false}
                                />
                                <ModalButton onClick={handleButtonTest} text="Play Test Game" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameStartModal;
