import { getClient } from "../helpers/client-config";
import { ETHEREUM_WRAPPER_URI, OWNER_TWO_PRIVATE_KEY, SAFE_MANAGER_URI } from "../helpers/constants";

const STORAGE_CONTRACT = "0x56535d1162011e54aa2f6b003d02db171c17e41e";
const NEW_STORED_NUMBER = "15"

const main = async () => {
  const clientWithOwnerOne = getClient();
  const clientWithOwnerTwo = getClient(OWNER_TWO_PRIVATE_KEY);

  const encodeTransaction = await clientWithOwnerOne.invoke({
    uri: ETHEREUM_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method: "function store(uint256 num) public",
      args: [NEW_STORED_NUMBER],
    },
  });
  if (!encodeTransaction.ok) throw encodeTransaction.error;
  console.log("Transaction encoded");

  const txToExecute = {
    data: encodeTransaction.value,
    to: STORAGE_CONTRACT,
    value: "0x",
  };

  const createTransaction = await clientWithOwnerOne.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: txToExecute,
    }
  });
  console.log("Transaction created!");

  if (!createTransaction.ok) throw createTransaction.error;
  const transaction = createTransaction.value;

  const ownerOneSignedTx = await clientWithOwnerOne.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction,
    }
  });
  if (!ownerOneSignedTx.ok) throw ownerOneSignedTx.error;

  const ownerTwoSignedTx = await clientWithOwnerTwo.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: ownerOneSignedTx.value,
    }
  });
  if (!ownerTwoSignedTx.ok) throw ownerTwoSignedTx.error;

  // @TODO: This transaction doesn't work with if this is invoked
  // with the `client` variable, throwing a GS026 error, not sure why
  const executeTransaction = await clientWithOwnerTwo.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: ownerTwoSignedTx.value,
    }
  });
  if (!executeTransaction.ok) throw executeTransaction.error;

  console.log("Transaction executed!");
  console.log(
    //@ts-ignore
    `https://goerli.etherscan.io/tx/${executeTransaction.value.transactionHash}`
  );
};

main().then();
