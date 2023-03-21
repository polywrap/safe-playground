import {
  ETHEREUM_WRAPPER_URI,
  getClient,
  SAFE_MANAGER_URI,
} from "../helpers/client-config";
import { config } from "dotenv";
import { Wallet } from "ethers";
config();

const connection = {
  networkNameOrChainId: "goerli",
};

const mockOwner = {
  signer: new Wallet(process.env.OWNER_TWO_PRIVATE_KEY as string),
  address: "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e",
};

const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670";
const STORAGE_CONTRACT = "0x56535d1162011e54aa2f6b003d02db171c17e41e"
const main = async () => {
  if (!process.env.OWNER_ONE_PRIVATE_KEY) {
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
  const mockSignerClient = getClient(mockOwner.signer);

  const encodeTransaction = await client.invoke({
    uri: ETHEREUM_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method: "function store(uint256 num) public",
      args: ["799"],
    },
  });
  if (!encodeTransaction.ok) throw encodeTransaction.error;
  console.log("Transaction encoded");

  const txToExecute = {
    data: encodeTransaction.value,
    to: STORAGE_CONTRACT,
    value: "0x",
  };

  const createTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: txToExecute,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection,
    },
  });
  console.log("Transaction created!");

  if (!createTransaction.ok) throw createTransaction.error;
  const transaction = createTransaction.value;

  const ownerOneSignedTx = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection,
    },
  });
  if (!ownerOneSignedTx.ok) throw ownerOneSignedTx.error;

  const ownerTwoSignedTx = await mockSignerClient.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: ownerOneSignedTx.value,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection,
    },
  });
  if (!ownerTwoSignedTx.ok) throw ownerTwoSignedTx.error;

  // @TODO: This transaction doesn't work with if this is invoked
  // with the `client` variable, throwing a GS026 error, not sure why
  const executeTransaction = await mockSignerClient.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: ownerTwoSignedTx.value,
    },
    env: {
      safeAddress: SAFE_ADDRESS,
      connection,
    },
  });
  if (!executeTransaction.ok) throw executeTransaction.error;

  console.log("Transaction executed!");
  console.log(
    //@ts-ignore
    `https://goerli.etherscan.io/tx/${executeTransaction.value.transactionHash}`
  );
};

main().then();
