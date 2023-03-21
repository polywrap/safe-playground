import { getClient, SAFE_MANAGER_URI } from "../../helpers/client-config";
import { config } from "dotenv";
import { Wallet } from "ethers";
config();

const connection = {
  networkNameOrChainId: "goerli",
};


const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670";

const main = async () => {
  if (!process.env.RPC_URL) {
    throw new Error(
      "You must define a RPC URL in the .env file. See .example.env"
    );
  }
  if (!process.env.OWNER_ONE_PRIVATE_KEY) {
    throw new Error(
      "You must define a owner one private key in the .env file. See .example.env"
    );
  }
  if (!process.env.OWNER_TWO_PRIVATE_KEY) {
    throw new Error(
      "You must define a owner two private key in the .env file. See .example.env"
    );
  }
  const mockOwner = {
    signer: new Wallet(process.env.OWNER_TWO_PRIVATE_KEY as string),
    address: "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e",
  };
  const client = getClient();

  const owners = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "getOwners",
    env: {
      safeAddress: SAFE_ADDRESS,
      connection,
    },
  });
  if (!owners.ok) throw owners.error;
  console.log(`Current owners of safe: ${owners.value}`);

  const removeOwnerEncoded = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "encodeRemoveOwnerData",
    args: {
      ownerAddress: mockOwner.address,
    },
    env: {
        safeAddress: SAFE_ADDRESS,
        connection
    }
  });
  if (!removeOwnerEncoded.ok) throw removeOwnerEncoded.error;

  const removeOwnerTransaction = {
    to: SAFE_ADDRESS,
    data: removeOwnerEncoded.value,
    value: "0"
  }

  const transaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: removeOwnerTransaction,
    },
    env: {
        safeAddress: SAFE_ADDRESS,
        connection
    }
  });
  if (!transaction.ok) throw transaction.error;
  console.log("Transaction created!")

  const signedTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
        tx: transaction.value
    },
    env: {
        safeAddress: SAFE_ADDRESS,
        connection
    }
  })
  if (!signedTransaction.ok) throw signedTransaction.error;
  console.log("Signature added!")

  const executeTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
        tx: signedTransaction.value
    },
    env: {
        safeAddress: SAFE_ADDRESS,
        connection
    }
  })
  if (!executeTransaction.ok) throw executeTransaction.error;
  console.log("Transaction executed!")
  console.log(`Owner with address ${mockOwner.address} has been removed`)
};

main().then();
