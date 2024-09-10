import { WalletContext } from './context/WalletContext';
import Header from './components/Header';
import { HomePage } from './components/HomePage';
import { isInCanvas } from './backend/isInFrame';
require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
    const inCanvas = isInCanvas();
    return (
        <div className="bg-black h-screen w-full flex flex-col">
            {!inCanvas && (
                <WalletContext>
                    <Header />
                    <HomePage />
                </WalletContext>
            )}
            {inCanvas && (
                <WalletContext>
                    <HomePage />
                </WalletContext>
            )}
        </div>
    );
}

export default App;
