import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';

function Header() {
    return (
        <div className="flex w-full h-14 justify-between items-center rounded-sm px-10 py-10 bg-dark-500 mb-20 z-20">
            <h1 className="text-green-500 text-3xl font-bold">Blink Snake</h1>
            <WalletMultiButton />
        </div>
    );
}

export default Header;
