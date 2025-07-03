# Solana Inscription CLI

This CLI tool lets you inscribe arbitrary text directly to Solana mainnet using the [Metaplex Inscription Program](https://developers.metaplex.com/inscription). No Arweave or Bundlr required—your data is fully on-chain.

## Features
- Generates a new Solana wallet (keypair) and saves it to `inscription-keypair.json`.
- Prompts for text to inscribe via CLI.
- Writes the text directly to Solana using the Metaplex Inscription program.
- Prints the Inscription account address and a link to the Metaplex Inscription Gateway for viewing.

## Prerequisites
- Node.js v18 or later
- Yarn or npm

## Install
```
yarn install
# or
npm install
```

## Usage
1. **Create a wallet:**
   ```
   node inscribe_text_to_solana.js
   ```
   The script will generate a new wallet and print the address. Fund this address with SOL (from an exchange or another wallet) to cover inscription fees.

2. **Fund the wallet:**
   - Use a Solana wallet or exchange to send SOL to the printed address.

3. **Inscribe text:**
   - Run the script again:
     ```
     node inscribe_text_to_solana.js
     ```
   - Press Enter after funding, then enter the text you want to inscribe.
   - The script will inscribe the text on-chain and print the Inscription account address and a Metaplex Inscription Gateway link.

## Viewing Your Inscription
- You can view your inscribed text on the [Metaplex Inscription Gateway](https://igw.metaplex.com/mainnet/):
  - The script will print a link like:
    ```
    https://igw.metaplex.com/mainnet/<InscriptionAccountAddress>
    ```
  - Open this link in your browser to view your on-chain inscription.

## Notes
- The wallet is saved as `inscription-keypair.json` in the script directory. Keep it safe!
- The inscription is fully on-chain and not tied to Arweave or Bundlr.
- You can repeat the process to inscribe more text using the same wallet.

## Dependencies
- [@metaplex-foundation/umi](https://github.com/metaplex-foundation/umi)
- [@metaplex-foundation/umi-bundle-defaults](https://github.com/metaplex-foundation/umi)
- [@metaplex-foundation/mpl-inscription](https://github.com/metaplex-foundation/mpl-inscription) # wts_inscription
