import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import GameStartModal from './modals/GameStartModal';
import GameOverModal from './modals/GameOverModal';
import ModalButton from './modals/ModalButton';
import { SnakeGame } from './SnakeGame';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { initializeGame } from '../backend/initializeGame';
import { initializeScore } from '../backend/initializeScore';

export const HomePage = () => {
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [showStartGameModal, setShowStartGameModal] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const snakeGameRef = useRef<{ resetGame: () => void }>(null);
    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState(0);
    const [timer, setTimer] = useState(3);

    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const captureScreenshot = () => {
        const canvasBody = document.querySelector('#snake-gameover');

        if (canvasBody && canvasBody !== null) {
            html2canvas(canvasBody as HTMLElement).then((canvas) => {
                setScreenshot(canvas.toDataURL('image/png'));
            });
        }
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const startGame = async () => {
        setShowStartGameModal(false);
        setScore(0);
        if (snakeGameRef.current) {
            snakeGameRef.current.resetGame();
        }
    };

    const startGameTest = () => {
        setShowStartGameModal(false);
        setScore(0);
        if (snakeGameRef.current) {
            snakeGameRef.current.resetGame();
        }
    };

    const handlePlayAgain = () => {
        startGame();
    };

    useEffect(() => {
        if (connection && wallet) initializeGame(connection, wallet, setRecord);
    }, [connection, wallet]);

    return (
        <div className="flex flex-col items-center justify-center gap-5">
            {!modalOpen ? (
                <div>
                    <SnakeGame
                        score={score}
                        setScore={setScore}
                        gameOver={gameOver}
                        setGameOver={setGameOver}
                        captureScreenshot={captureScreenshot}
                        ref={snakeGameRef}
                        record={record}
                        connection={connection}
                    />
                    {gameOver && !showStartGameModal && (
                        <GameOverModal
                            score={score}
                            closeModal={closeModal}
                            handlePlayAgain={handlePlayAgain}
                            handleClose={setModalOpen}
                            connection={connection}
                        />
                    )}
                    {showStartGameModal && <GameStartModal startGame={startGame} startGameTest={startGameTest} />}
                </div>
            ) : (
                <div className="flex gap-6 flex-col items-center overflow-auto">
                    <img
                        className="object-contain w-full h-[calc(100vh-250px)]"
                        src={screenshot ? screenshot : ''}
                        alt="Screenshot"
                    />
                    <ModalButton text="Play again" onClick={closeModal} />
                </div>
            )}
        </div>
    );
};
