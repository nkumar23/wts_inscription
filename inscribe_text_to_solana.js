#!/usr/bin/env node
// Script: inscribe_text_to_solana.js
// Purpose: Inscribe arbitrary text to Solana devnet using Metaplex Inscription (fully on-chain)

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplInscription, initialize, writeData, findInscriptionMetadataPda } from '@metaplex-foundation/mpl-inscription';
import { generateSigner, keypairIdentity, TransactionBuilder } from '@metaplex-foundation/umi';
import bs58 from 'bs58';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WALLET_PATH = path.join(__dirname, 'inscription-keypair.json');
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

// --- 1. Create or load wallet ---
function loadOrCreateKeypair(umi) {
  if (fs.existsSync(WALLET_PATH)) {
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_PATH)));
    return umi.eddsa.createKeypairFromSecretKey(secret);
  } else {
    const kp = umi.eddsa.generateKeypair();
    fs.writeFileSync(WALLET_PATH, JSON.stringify(Array.from(kp.secretKey)));
    console.log('New wallet created! Please fund this address with SOL:');
    console.log(kp.publicKey.toString());
    process.exit(0);
  }
}

// --- 2. Prompt for inscription text ---
function promptText() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter the text you want to inscribe: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// --- 3. Main flow ---
async function main() {
  try {
    // Set up Umi
    const umi = createUmi(SOLANA_RPC).use(mplInscription());
    
    // Load or create keypair
    const kp = loadOrCreateKeypair(umi);
    umi.use(keypairIdentity(kp));
    
    console.log('✅ Loaded wallet:', kp.publicKey.toString());
    console.log('💰 Ensure this wallet is funded with enough SOL for inscription fees.');

    // Wait for user to confirm funding
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise((resolve) => {
      rl.question('Press Enter once the wallet is funded... ', () => {
        rl.close();
        resolve();
      });
    });

    // Prompt for text
    const text = await promptText();
    if (!text || !text.trim()) {
      console.error('❌ No text provided. Exiting.');
      process.exit(1);
    }

    console.log('🚀 Creating inscription for text:', text);

    // Create a new Inscription account
    const inscriptionAccount = generateSigner(umi);
    const inscriptionMetadataAccount = findInscriptionMetadataPda(umi, {
      inscriptionAccount: inscriptionAccount.publicKey,
    });

    console.log('📝 Inscription account:', inscriptionAccount.publicKey.toString());

    // Build transaction: initialize and write data
    let builder = new TransactionBuilder();
    
    // Initialize the inscription
    builder = builder.add(
      initialize(umi, { 
        inscriptionAccount,
        inscriptionMetadataAccount
      })
    );
    
    // Write the data
    builder = builder.add(
      writeData(umi, {
        inscriptionAccount: inscriptionAccount.publicKey,
        inscriptionMetadataAccount,
        value: Buffer.from(text, 'utf8'),
        associatedTag: null,
        offset: 0,
      })
    );

    console.log('📡 Sending transaction to Solana mainnet...');

    // Send transaction
    const result = await builder.sendAndConfirm(umi, { 
      confirm: { commitment: 'finalized' } 
    });

    // Print result
    console.log('🎉 Inscription complete!');
    console.log('📋 Inscription Account Address:', inscriptionAccount.publicKey.toString());
    const signatureString = bs58.encode(result.signature);
    console.log('🔗 Transaction Signature:', signatureString);
    console.log('🌐 View on Solana Explorer: https://explorer.solana.com/tx/' + signatureString + '?cluster=mainnet');
    console.log('📖 View on Metaplex Inscription Gateway: https://igw.metaplex.com/mainnet/' + inscriptionAccount.publicKey.toString());
    
  } catch (error) {
    console.error('❌ Error during inscription:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('💡 Tip: Make sure your wallet has enough SOL for transaction fees');
    }
    process.exit(1);
  }
}; 

main();