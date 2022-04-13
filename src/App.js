import { useState, useEffect } from "react";
import { Contract, ethers } from "ethers";
import Wallet from "./artifacts/contracts/Wallet.sol/Wallet.json";

import "./App.css";

const walletAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
    const [balance, setBalance] = useState(0);
    const [amountSend, setAmountSend] = useState();
    const [amountWithdraw, setAmountWithdraw] = useState();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        getBalance();
    }, []);

    async function getBalance() {
        if (typeof window.ethereum !== "undefined") {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
                walletAddress,
                Wallet.abi,
                provider
            );

            try {
                let overrides = {
                    from: accounts[0],
                };
                const data = await contract.getBalance(overrides);
                setBalance(String(data));
            } catch (error) {
                setError("Une erreur est survenue.");
            }
        }
    }

    async function transfer() {
        if (!amountSend) {
            return;
        }
        setError("");
        setSuccess("");
        if (typeof window.ethereum !== "undefined") {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            try {
                const tx = {
                    from: accounts[0],
                    to: walletAddress,
                    value: ethers.utils.parseEther(amountSend),
                };
                const transaction = await signer.sendTransaction(tx);
                await transaction.wait();
                setAmountSend("");
                getBalance();
                setSuccess(
                    "Votre argent a bien été transféré sur le portefeuille !"
                );
            } catch (error) {
                setError("Une erreur est survenue.");
            }
        }
    }

    async function withdraw() {
        if (!amountWithdraw) {
            return;
        }
        setError("");
        setSuccess("");
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(walletAddress, Wallet.abi, signer);

        try {
            const transaction = await contract.withdraw(
                accounts[0],
                ethers.utils.parseEther(amountWithdraw)
            );
            await transaction.wait();
            setAmountWithdraw("");
            getBalance("");
            setSuccess("Votre argent a bien été retiré du portefeuille !");
        } catch (error) {
            setError("Une erreur est survenue.");
        }
    }

    function changeAmountSend(amount) {
        setAmountSend(amount.target.value);
    }

    function changeAmountWithdraw(amount) {
        setAmountWithdraw(amount.target.value);
    }

    return (
        <div className="App">
            <div className="container">
                <div className="logo">
                    <i className="fa-brands fa-ethereum"></i>
                </div>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <h2>
                    {balance / 10 ** 18} <span className="eth">eth</span>
                </h2>
                <div className="wallet__flex">
                    <div className="walletG">
                        <h3>Envoyer de l'ether</h3>
                        <input
                            type="text"
                            placeholder="Montant en Ethers"
                            onChange={changeAmountSend}
                        />
                        <button onClick={transfer}>Envoyer</button>
                    </div>
                    <div className="walletD">
                        <h3>Retirer de l'ether</h3>
                        <input
                            type="text"
                            placeholder="Montant en Ethers"
                            onChange={changeAmountWithdraw}
                        />
                        <button onClick={withdraw}>Retirer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
