import { useEffect, useRef } from 'react';

const useAnimationFrame = (callback: (n: number) => void, speed: number) => {
    const requestRef = useRef(-1);
    const previousTimeRef = useRef(-1);

    const animate = (time: number) => {
        if (previousTimeRef.current !== -1) {
            const deltaTime = time - previousTimeRef.current;
            if (deltaTime > speed) {
                callback(deltaTime);
                previousTimeRef.current = time;
            }
        } else {
            previousTimeRef.current = time;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return requestRef;
};

export default useAnimationFrame;
