//Generate Account A liquidity pool
import { Transaction, Keypair, SystemProgram, Connection, PublicKey } from "@solana/web3.js";
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap";
import * as token from "@solana/spl-token"




function loadKeypair(filename: string) : Keypair{
    const secret = JSON.parse(fs.readFileSync(filename).toString()) as number []
    const secretKey = Uint8Array.from(secret)
    return Keypair.fromSecretKey(secretKey)
}


async function main(){
const connection = new Connection("https://api.devnet.solana.com");
const wallet = loadKeypair('.\JamQTFiWzB1NRPcjWSU3WjSfK31g67GNg3MMYox8LKS.json')
const transaction = new Transaction();
const tokenSwapStateAccount = Keypair.generate();
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

const tokenSwapInitSwapInstruction = TokenSwap.createInitSwapInstruction(
    tokenSwapStateAccount.publicKey,
    swapAuthority
)


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

// TS:35:45
















//Swap pool authority
//Token account A
//Token account B
//Pool token mint
//Pool token account
//Pool token fee account














//Generate Account B liquidity pool