import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Wallet from "./artifacts/contracts/Wallet.sol/Wallet.json";

import "./App.css";

const walletAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
    const [balance, setBalance] = useState(0);
    const [metamaskBalance, setMetamaskBalance] = useState(0);
    const [amountSend, setAmountSend] = useState();
    const [amountSendExternalAddress, setAmountSendExternalAddress] =
        useState();
    const [accountAddress, setAccountAddress] = useState();
    const [amountWithdraw, setAmountWithdraw] = useState();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        getBalance();
        getMetamaskBalance();
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

    async function getMetamaskBalance() {
        if (typeof window.ethereum !== "undefined") {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const metamaskAccount = await provider.getBalance(accounts[0]);
            const metamaskBalance = ethers.utils.formatEther(metamaskAccount);
            setMetamaskBalance(metamaskBalance);
        }
    }

    async function stake() {
        if (!amountSend || parseInt(amountSend) === 0) {
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
                setAmountSend();
                getBalance();
                getMetamaskBalance();
                setSuccess(
                    "Votre argent a bien été transféré sur le portefeuille !"
                );
            } catch (error) {
                setError("Une erreur est survenue.");
            }
        }
    }

    async function send() {
        if (
            !amountSendExternalAddress ||
            parseInt(amountSendExternalAddress) === 0 ||
            !accountAddress
        ) {
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
                    to: accountAddress,
                    value: ethers.utils.parseEther(amountSendExternalAddress),
                };
                const transaction = await signer.sendTransaction(tx);
                await transaction.wait();
                setAmountSendExternalAddress("");
                getMetamaskBalance("");
                setSuccess("Votre argent a bien été envoyé !");
            } catch (error) {
                console.log(error);
                setError("Une erreur est survenue.");
            }
        }
    }

    async function withdraw() {
        if (!amountWithdraw || parseInt(amountSend) === 0) {
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
            setAmountWithdraw();
            getBalance();
            getMetamaskBalance();
            setSuccess("Votre argent a bien été retiré du portefeuille !");
        } catch (error) {
            setError("Une erreur est survenue.");
        }
    }

    function changeAmountSend(amount) {
        setAmountSend(amount.target.value);
    }

    function changeAmountSendExternalAddress(amount) {
        setAmountSendExternalAddress(amount.target.value);
    }

    function changeAmountWithdraw(amount) {
        setAmountWithdraw(amount.target.value);
    }

    function changeAccountAddress(address) {
        setAccountAddress(address.target.value);
    }

    return (
        <div className="App">
            <div className="container">
                <div className="logo">
                    <i className="fa-brands fa-ethereum"></i>
                </div>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <div className="wallet__flex">
                    <div className="walletG">
                        <h2>
                            {balance / 10 ** 18}{" "}
                            <span className="eth">eth</span>
                        </h2>
                        <div className="staking">
                            <h3>Staking</h3>
                            <input
                                type="number"
                                placeholder="Montant en Ethers"
                                onChange={changeAmountSend}
                            />
                            <button onClick={stake}>Staker</button>
                        </div>

                        <div className="withdraw">
                            <h3>Withdraw</h3>
                            <input
                                className="withdrawInput withdrawAmount"
                                type="number"
                                placeholder="Montant en Ethers"
                                onChange={changeAmountWithdraw}
                            />
                            <button onClick={withdraw}>Retirer</button>
                        </div>
                    </div>
                    <div className="walletD">
                        <h2>
                            {parseInt(metamaskBalance)}{" "}
                            <span className="eth">eth</span>
                        </h2>
                        <div className="sendContainer">
                            <h3>Envoyer</h3>
                            <div className="sendInputs">
                                <input
                                    className="sendAmount"
                                    type="number"
                                    placeholder="Montant en Ethers"
                                    onChange={changeAmountSendExternalAddress}
                                />
                                <div className="sendLogo">
                                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                                </div>

                                <input
                                    className="sendAddress"
                                    type="text"
                                    placeholder="Adresse"
                                    onChange={changeAccountAddress}
                                />
                                <button onClick={send}>Envoyer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
