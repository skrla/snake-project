import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { APPLE_START, CANVAS_SIZE, DIRECTIONS, SCALE, SNAKE_START, SPEED } from '../util/constants';
import { useInterval } from '../hooks/useInterval';
import { DirectionKeys } from '../util/types';
import Arrows from './Arrows';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { updateScore } from '../backend/updateScore';
const bodyImgSrc = require('../assets/giftbox.png');
const headImgSrc = require('../assets/santa-claus.png');
const appleImgSrc = require('../assets/giftbox.png');

type SnakeGameProps = {
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    gameOver: boolean;
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    captureScreenshot: () => void;
    record: number;
    connection?: Connection;
};

export const SnakeGame = forwardRef(
    ({ score, setScore, gameOver, setGameOver, captureScreenshot, record, connection }: SnakeGameProps, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [snake, setSnake] = useState(SNAKE_START);
        const [apple, setApple] = useState(APPLE_START);
        const [dir, setDir] = useState<[number, number]>(DIRECTIONS[38]);
        const [speed, setSpeed] = useState<number>(0);
        const [currentDirection, setCurrentDirection] = useState<DirectionKeys>(38);
        const [currentSnakePosition, setCurrentSnakePosition] = useState(SNAKE_START);
        const [rotationAngle, setRotationAngle] = useState(0);
        const [bodyImg, setBodyImg] = useState<HTMLImageElement | null>(null);
        const [appleImg, setAppleImg] = useState<HTMLImageElement | null>(null);
        const [headImg, setHeadImg] = useState<HTMLImageElement | null>(null);
        const wallet = useAnchorWallet();

        const gameLoop = () => {
            const snakeCopy = JSON.parse(JSON.stringify(snake));
            const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
            snakeCopy.unshift(newSnakeHead);

            const newRotationAngle = dir[0] === 1 ? 90 : dir[0] === -1 ? -90 : 0;

            setRotationAngle(newRotationAngle);

            if (checkCollision(newSnakeHead)) endGame();
            if (checkAppleCollision(snakeCopy)) {
                setScore((prevScore) => prevScore + 1);
                let newApple = createApple();
                while (checkCollision(newApple, snakeCopy)) {
                    newApple = createApple();
                }
                setApple(newApple);
                setSpeed((prevSpeed) => Math.max(150, prevSpeed - 2));
            } else {
                snakeCopy.pop();
            }
            setSnake(snakeCopy);
        };

        const endGame = () => {
            if (connection && wallet) updateScore(connection, wallet, score);
            setSpeed(0);
            setGameOver(true);
            captureScreenshot();
        };

        const resetGame = () => {
            setSnake(SNAKE_START);
            setApple(APPLE_START);
            setDir([0, -1]);
            setSpeed(SPEED);
            setGameOver(false);
            setCurrentDirection(38);
            setCurrentSnakePosition(SNAKE_START);
            canvasRef.current && canvasRef.current.focus();
        };

        useImperativeHandle(ref, () => ({
            resetGame,
        }));

        const moveSnake = ({ keyCode }: any) => {
            if (currentSnakePosition === snake) {
                return;
            }
            if (!(keyCode >= 37 && keyCode <= 40)) {
                return;
            }
            if (
                (currentDirection === 37 && keyCode === 39) ||
                (currentDirection === 38 && keyCode === 40) ||
                (currentDirection === 39 && keyCode === 37) ||
                (currentDirection === 40 && keyCode === 38)
            ) {
                return;
            }
            setCurrentDirection(keyCode);
            setCurrentSnakePosition(snake);
            keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);
        };

        const createApple = () => apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

        const checkCollision = (piece: number[], snk = snake) => {
            if (
                piece[0] * SCALE >= CANVAS_SIZE[0] ||
                piece[0] < 0 ||
                piece[1] * SCALE >= CANVAS_SIZE[1] ||
                piece[1] < 0
            )
                return true;

            for (const segment of snk) {
                if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
            }
            return false;
        };

        const checkAppleCollision = (newSnake: number[][]) => {
            if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
                let newApple = createApple();
                while (checkCollision(newApple, newSnake)) {
                    newApple = createApple();
                }
                setApple(newApple);
                return true;
            }
            return false;
        };

        useInterval(() => {
            if (!gameOver) {
                gameLoop();
            }
        }, speed);

        useEffect(() => {
            const loadImage = (
                src: string,
                setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
            ) => {
                const img = new Image();
                img.src = src;
                img.onload = () => setImage(img);
                img.onerror = () => console.error(`Failed to load image: ${src}`);
            };

            loadImage(bodyImgSrc, setBodyImg);
            loadImage(appleImgSrc, setAppleImg);
            loadImage(headImgSrc, setHeadImg);
        }, [bodyImgSrc, appleImgSrc, headImgSrc]);

        useEffect(() => {
            if (!canvasRef.current || !bodyImg || !appleImg || !headImg) {
                return;
            }
            const context = canvasRef.current.getContext('2d');
            if (!context) return;

            context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
            context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);

            snake.slice(1).forEach(([x, y]) => {
                //context.drawImage(bodyImg, x, y, 1, 1)
                context.fillStyle = '#009374';
                context.fillRect(x, y, 1, 1);
            });

            const [appleX, appleY] = apple;
            context.fillStyle = '#DC3E2D';
            context.fillRect(appleX, appleY, 1, 1);
            //            context.drawImage(appleImg, appleX, appleY, 1, 1);

            const [headX, headY] = snake[0];
            context.save();
            context.translate(headX + 0.5, headY + 0.5);
            context.fillStyle = '#009374';
            context.fillRect(-0.5, -0.5, 1, 1);
            //           context.drawImage(headImg, -0.5, -0.5, 1, 1);
            context.restore();
        }, [snake, apple, gameOver, rotationAngle, bodyImg, appleImg, headImg]);

        return (
            <div tabIndex={0} onKeyDown={(e) => moveSnake(e)}>
                <div id="snake-gameover" className="flex flex-col bg-black">
                    <div
                        className={`flex items-center w-full bg-green-500 px-6 py-4 gap-6 ${
                            record === 0 ? 'justify-center' : 'justify-between'
                        }`}
                    >
                        <p className="text-white-500 font-bold">Score: {score}</p>
                        {record !== 0 && <p className="text-white-500 font-bold">Record: {record}</p>}
                    </div>
                    <canvas
                        className="flex shadow-lg bg-dark-500"
                        ref={canvasRef}
                        width={`${CANVAS_SIZE[0]}px`}
                        height={`${CANVAS_SIZE[1]}px`}
                        tabIndex={0}
                        style={{ outline: 'none' }}
                    />
                </div>
                <Arrows />
            </div>
        );
    }
);
