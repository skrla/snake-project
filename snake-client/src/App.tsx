import { WalletContext } from './context/WalletContext';
import Header from './components/Header';
import { HomePage } from './components/HomePage';
require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
    return (
        <div className="bg-black h-screen w-full flex flex-col">
            <WalletContext>
                <Header />
                <HomePage />
            </WalletContext>
        </div>
    );
}

export default App;
