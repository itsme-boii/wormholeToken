import { useState } from "react";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import {
  Wormhole,
  amount,
  wormhole,
  isTokenId,
  TokenTransfer,
} from "@wormhole-foundation/sdk";
import "./App.css";

function App() {
  const [transferStatus, setTransferStatus] = useState("");

  const handleTransfer = async () => {
    try {
      setTransferStatus("Initializing transfer...");

      // Initialize Wormhole SDK
      const wh = await wormhole("Testnet", [solana, evm], {
        chains: {
          Ethereum: {
            rpc: "https://sepolia.infura.io/v3/246d3d2a730c42e28557d6bd30250993",
            explorer: "https://sepolia.etherscan.io/",
          },
        },
      });

      console.log("Wormhole initialized:", wh);

      // Send Chain
      const sendChain = wh.getChain("Solana");
      sendChain.getAutomaticTokenBridge();
      console.log("Send Chain:", sendChain);

      // Sender Address
      const senderAddress = "EhmycoHGjGLzQAwZwnDwnCfrmxnueW5LF1AY9MDS6SwN";
      const source = Wormhole.chainAddress(sendChain.chain, senderAddress);

      // Receiver Chain
      const rcvChain = wh.getChain("Ethereum");
      console.log("Receiver Chain:", rcvChain);

      // Receiver Address
      const receiverAddress = "0xCdD22497fd692b48246006a1846533f7F7cc922D";
      const destination = Wormhole.chainAddress(
        rcvChain.chain,
        receiverAddress
      );

      // Token Details
      const token = Wormhole.tokenId(
        sendChain.chain,
        "7VPWjBhCXrpYYBiRKZh1ubh9tLZZNkZGp2ReRphEV4Mc"
      );
      console.log("Token:", token);

      const decimals = isTokenId(token)
        ? Number(await wh.getDecimals(token.chain, token.address))
        : sendChain.config.nativeTokenDecimals;
      console.log("Decimals:", decimals);

      // Transfer Amount
      const amt = amount.units(amount.parse("1", decimals));
      const nativeGas = amount.units(amount.parse("0.5", decimals));
      console.log("Amount:", amt);

      // Token Transfer
      const xfer = await wh.tokenTransfer(
        token,
        amt,
        source,
        destination,
        true, // Automatic
        false, // Round Trip
        nativeGas
      );
      console.log("Transfer Object:", xfer);

      // Get Transfer Quote
      const quote = await TokenTransfer.quoteTransfer(
        wh,
        sendChain,
        rcvChain,
        xfer.transfer
      );
      console.log("Quote:", quote);

      setTransferStatus("Transfer completed successfully!");
    } catch (error) {
      console.error("Error during transfer:", error);
      setTransferStatus("Transfer failed! Check the console for details.");
    }
  };

  return (
    <div className="App">
      <h1>Wormhole Token Transfer</h1>
      <button onClick={handleTransfer}>Start Transfer</button>
      <p>Status: {transferStatus}</p>
    </div>
  );
}

export default App;
