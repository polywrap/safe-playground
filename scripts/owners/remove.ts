import { getClient, SAFE_MANAGER_URI } from "../../helpers/client-config";
import { config } from "dotenv";
import { Wallet } from "ethers";
config();

const connection = {
  networkNameOrChainId: "goerli",
};

const mockOwner = {
  signer: new Wallet(
    "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
  ),
  address: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
};

const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670";

const main = async () => {
  if (!process.env.RPC_URL) {
    throw new Error(
      "You must define a RPC URL in the .env file. See .example.env"
    );
  }

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
