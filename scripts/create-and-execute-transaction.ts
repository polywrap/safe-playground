import { ETHEREUM_WRAPPER_URI, getClient, SAFE_MANAGER_URI } from "../helpers/client-config";
import { config } from "dotenv";
// import { Wallet } from "ethers";
config();

const connection = {
  networkNameOrChainId: "goerli",
};
const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670"

const main = async () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error(
      "You must define a private key in the .env file. See .example.env"
    );
  }

  if (!process.env.RPC_URL) {
    throw new Error(
      "You must define a RPC URL in the .env file. See .example.env"
    );
  }

  const client = getClient();

  // Get signer address
  const signerAddress = await client.invoke({
    uri: ETHEREUM_WRAPPER_URI,
    method: "getSignerAddress",
    args: {
      connection,
    }
  });

  if (!signerAddress.ok) throw signerAddress.error;
  console.log(`Signer address: ${signerAddress.value}`)

  const encodeTransaction = await client.invoke({
    uri: ETHEREUM_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method: "function store(uint256 num) public",
      args: ["99"]
    }
  })
  if (!encodeTransaction.ok) throw encodeTransaction.error;
  console.log("Transaction encoded")

  // Transaction to be send
  // @TODO: Create complex transactions
  const txToExecute = {
    data: encodeTransaction.value,
    to: "0x56535d1162011e54aa2f6b003d02db171c17e41e",
    value: "0x"
  };

  const createTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: txToExecute,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection
    }
  });
  console.log("Transaction created!")

  if (!createTransaction.ok) throw createTransaction.error;
  const transaction = createTransaction.value;

  const signedTx = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection
    }
  });
  if (!signedTx.ok) throw signedTx.error;

  const executeTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: signedTx.value
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection
    }
  });
  if (!executeTransaction.ok) throw executeTransaction.error;

  console.log("Transaction executed!");
  //@ts-ignore
  console.log(`https://goerli.etherscan.io/tx/${executeTransaction.value.transactionHash}`)
};

main().then();
