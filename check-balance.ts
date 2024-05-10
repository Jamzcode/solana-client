import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";


const suppliedPublicKey = process.argv[2];
if(!suppliedPublicKey){
    throw new Error("Provide a public key to check the balance of!");
}


const publicKey = new PublicKey("31ZdXAvhRQyzLC2L97PC6Lnf2yWgHhQUKKYoUo9MLQF5");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

console.log(`💰 Finished! The balance for the wallet at address ${publicKey} is ${balanceInSol}!`)