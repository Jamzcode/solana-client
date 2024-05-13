//Generate Account A liquidity pool
import { Transaction, Keypair, SystemProgram, Connection, PublicKey } from "@solana/web3.js";
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap";
import * as token from "@solana/spl-token"
import * as fs from "fs"




function loadKeypair(filename: string) : Keypair{
    const secret = JSON.parse(fs.readFileSync(filename).toString()) as number []
    const secretKey = Uint8Array.from(secret)
    return Keypair.fromSecretKey(secretKey)
}

async function getTokenAccountCreationInstruction(mint: PublicKey, swapAuthority: PublicKey, payer: PublicKey): Promise<[PublicKey,TransactionInstruction]>{

    let tokenAccountAddress = await token.getAssociatedTokenAddress(
        Mint, //mint
        swapAuthority, //owner
        true //allow owner off curve
    )

    const tokenAccountInstruction = await token.createAssociatedTokenAccountInstruction(
        wallet.publicKey, //payer
        tokenAccountAddress, //ata - associated token account
        swapAuthority, //owner
        Mint // mint
    )

    return [tokenAccountAddress, tokenAccountInstruction];
}


async function main(){
const connection = new Connection("https://api.devnet.solana.com");

//TODO: Find solution to unfunded account (31 SOL currently in wallet)
const wallet = loadKeypair("//WALLET PK")
const transaction = new Transaction();
const tokenSwapStateAccount = loadKeypair("//TOKEN SWAP AUTHORITY PK");
const rent = await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection);
const tokenSwapAccountCreationInstruction = await SystemProgram.createAccount({
    newAccountPubkey: tokenSwapStateAccount.publicKey,
    fromPubkey: wallet.publicKey,
    lamports: rent,
    space: TokenSwapLayout.span,
    programId: TOKEN_SWAP_PROGRAM_ID
})
transaction.add(tokenSwapAccountCreationInstruction)

const [swapAuthority, bump] = await PublicKey.findProgramAddressSync(
    [tokenSwapStateAccount.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
)
console.log("swap authority: " + swapAuthority.toBase58())





//TODO: reinstatiate new token A & B public keys when swapAuthority account is funded.
const tokenBMint = new PublicKey("//TOKEN B PK")
const tokenAMint = new PublicKey("//TOKEN A PK")

const [tokenATokenAccount, taci] = await getTokenAccountCreationInstruction(tokenAMint, swapAuthority, wallet.publicKey);
const [tokenBTokenAccount, tbci] = await getTokenAccountCreationInstruction(tokenBMint, swapAuthority, wallet.publicKey);

// const tokenSwapInitSwapInstruction = TokenSwap.createInitSwapInstruction(
//     tokenSwapStateAccount.publicKey,
//     swapAuthority,
//     tokenATokenAccount,
//     tokenBTokenAccount,
// )


let tokenAAccountAddress = await token.getAssociatedTokenAddress(
    tokenAMint, // mint
    swapAuthority, // owner
    true // allow owner off curve
)

const tokenAAccountInstruction = await token.createAssociatedTokenAccountInstruction(
    wallet.publicKey, //payer
    tokenAAccountAddress, // ata
    swapAuthority, // owner
    tokenAMint // mint
)

transaction.add(tokenAAccountInstruction)


}

main();






















//Swap pool authority
//Token account A
//Token account B
//Pool token mint
//Pool token account
//Pool token fee account














//Generate Account B liquidity pool