import { getClient } from "../../helpers/client-config";
import { SAFE_ADDRESS, SAFE_MANAGER_URI } from "../../helpers/constants";
import { checkSenderBalance } from "../../helpers/setup";

const OWNER_TO_BE_REMOVED = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

const main = async () => {
  const client = getClient();

  await checkSenderBalance(client);

  const owners = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "getOwners"
  });
  if (!owners.ok) throw owners.error;
  console.log(`Current owners of safe: ${owners.value}`);

  const removeOwnerEncoded = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "encodeRemoveOwnerData",
    args: {
      ownerAddress: OWNER_TO_BE_REMOVED,
    }
  });
  if (!removeOwnerEncoded.ok) throw removeOwnerEncoded.error;

  const removeOwnerTransaction = {
    to: SAFE_ADDRESS,
    data: removeOwnerEncoded.value,
    value: "0",
  };

  const transaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: removeOwnerTransaction,
    }
  });
  if (!transaction.ok) throw transaction.error;
  console.log("Transaction created!");

  const signedTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction.value,
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
  console.log(`Owner with address ${OWNER_TO_BE_REMOVED} has been removed`);
};

main().then();
