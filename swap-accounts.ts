//Generate Account A liquidity pool
import { Transaction, Keypair, SystemProgram, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout, CurveType } from "@solana/spl-token-swap";
import * as token from "@solana/spl-token"
import * as fs from "fs"




function loadKeypair(filename: string) : Keypair{
    const secret = JSON.parse(fs.readFileSync(filename).toString()) as number []
    const secretKey = Uint8Array.from(secret)
    return Keypair.fromSecretKey(secretKey)
}






async function getTokenAccountCreationInstruction(mint: PublicKey, owner: PublicKey, payer: PublicKey): Promise<[PublicKey,TransactionInstruction]>{

    let tokenAccountAddress = await token.getAssociatedTokenAddress(
        mint, //mint
        owner, //owner
        true //allow owner off curve
    )

    const tokenAccountInstruction = await token.createAssociatedTokenAccountInstruction(
       payer, //payer
        tokenAccountAddress, //ata - associated token account
        owner, //owner
        mint // mint
    )

    return [tokenAccountAddress, tokenAccountInstruction];
}










async function main(){
const connection = new Connection("https://api.devnet.solana.com");
//TODO: Find solution to unfunded account (31 SOL currently in wallet)
const wallet = loadKeypair("BobGbUVZECBYxgodAy4RpJmc7YY4eg5ZEjmjHQdLVXN8.json")
const transaction = new Transaction();
const tokenSwapStateAccount = loadKeypair("TSeCqT1b5WGZHFwPC14xgU1pGHNKNzqZSXCrAPFgFJh.json");
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






const tokenBMint = new PublicKey("BtohU1BCLKTawemeQ4VyXnhZVyp7vh8TJH3GxTpnCm2i")
const tokenAMint = new PublicKey("AToSMeyU43AACpCwwwD5k8w9jYokadE6QUJLvbvoDt9j")
const [tokenATokenAccount, taci] = await getTokenAccountCreationInstruction(tokenAMint, swapAuthority, wallet.publicKey);
const [tokenBTokenAccount, tbci] = await getTokenAccountCreationInstruction(tokenBMint, swapAuthority, wallet.publicKey);
transaction.add(taci, tbci)

// const signx = await connection.sendTransaction(transaction, [wallet, tokenSwapStateAccount]);
// console.log(signx)





const poolTokenMint = new PublicKey("LPTn5bGw8c6utXSe4mVWYn6RnUU2JkgV3jXQgVNYr19");
const tokenAccountPool = Keypair.generate()
const poolAccountRent = await token.getMinimumBalanceForRentExemptAccount(connection)
const createTokenAccountPoolInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: tokenAccountPool.publicKey,
    space: token.ACCOUNT_SIZE,
    lamports: poolAccountRent,
    programId: token.TOKEN_PROGRAM_ID,
})
const initializeTokenAccountPoolInstruction = token.createInitializeAccountInstruction(
    tokenAccountPool.publicKey,
    poolTokenMint,
    wallet.publicKey
)
transaction.add(createTokenAccountPoolInstruction, initializeTokenAccountPoolInstruction)

const feeOwner = new PublicKey('HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN')




const [tokenFeeAccountAddress, tfaci] = await getTokenAccountCreationInstruction(
    poolTokenMint, feeOwner, wallet.publicKey
)
transaction.add(tfaci);


const tokenFeeAccountInstruction = await token.createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    tokenFeeAccountAddress,
    feeOwner,
    poolTokenMint
)










const tokenSwapInitSwapInstruction = TokenSwap.createInitSwapInstruction(
    tokenSwapStateAccount,
    swapAuthority,
    tokenATokenAccount,
    tokenBTokenAccount,
    tokenAccountPool.publicKey,
    tokenFeeAccountAddress,
    tokenAccountPool.publicKey,
    token.TOKEN_PROGRAM_ID,
    TOKEN_SWAP_PROGRAM_ID,
    0n,
    100n,
    5n,
    10000n,
    0n,
    100n,
    1n,
    100n,
    CurveType.ConstantProduct,

)
transaction.add(tokenSwapInitSwapInstruction)

const signature = await connection.sendTransaction(transaction, [wallet, tokenAccountPool]);
console.log(signature)
console.log(transaction)


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



