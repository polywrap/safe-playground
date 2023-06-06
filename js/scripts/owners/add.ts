import { getClient } from "../../helpers/client-config";
import { SAFE_ADDRESS, SAFE_MANAGER_URI } from "../../helpers/constants";

const OWNER_TO_BE_ADDED = "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e"

const main = async () => {
  const client = getClient();

  const owners = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "getOwners"
  });
  if (!owners.ok) throw owners.error;
  console.log(`Current owners of safe: ${owners.value}`);

  const addOwnerEncoded = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "encodeAddOwnerWithThresholdData",
    args: {
      ownerAddress: OWNER_TO_BE_ADDED
    }
  });
  if (!addOwnerEncoded.ok) throw addOwnerEncoded.error;

  const addOwnerTransaction = {
    to: SAFE_ADDRESS,
    data: addOwnerEncoded.value,
    value: "0",
  };

  const transaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: addOwnerTransaction,
    }
  });
  if (!transaction.ok) throw transaction.error;
  console.log("Transaction created!");

  const signedTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction.value,
      signingMethod: "eth_signTypedData",
    }
  });
  if (!signedTransaction.ok) throw signedTransaction.error;
  console.log("Signature added!");

  const executeTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: signedTransaction.value,
    }
  });
  if (!executeTransaction.ok) throw executeTransaction.error;
  console.log("Transaction executed!");
  console.log(`Owner with address ${OWNER_TO_BE_ADDED} has been added`);
};

main().then();
