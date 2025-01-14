import { Keypair } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

import dotenv from "dotenv"
dotenv.config();




const keypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(`✅ Finished! We've loaded our secret key securely, using an env file!`)


//public key1: C6m7axuLmzbwbvZ1qDK2CweEhYEQcSYSNag9LGAj31g6

// secret key1: [
//    71, 214, 173, 154,  93,  32,  62,  19, 147, 149, 204,
//    85,  87, 205,  36, 236,  85, 100, 109,  17,  82,  89,
//    38,  24, 156, 249, 197, 238,  29,  74, 184, 232, 164,
//   234,  86, 238, 167, 153, 104, 191,  59,  78, 105,  12,
//   134, 109, 189, 252, 238, 104, 197, 132, 183, 140,   5,
//   173,  26,  58, 102, 168, 103, 129, 227, 171
// ]