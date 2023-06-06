import { getClient } from "../helpers/client-config";
import { BigNumber } from "ethers";
import { PolywrapClient } from "@polywrap/client-js";
import {
  CONNECTION,
  ETHERS_CORE_WRAPPER_URI,
  ETHERS_UTILS_WRAPPER_URI,
  OWNER_TWO_PRIVATE_KEY,
  SAFE_ADDRESS,
  SAFE_MANAGER_URI,
} from "../helpers/constants";

const ERC20_ADDRESS = "0xbC53a5E6E01b308b6A1BaC3d273990EF8837452d";

const AMOUNT_TO_TRANSFER = BigNumber.from("100000000000000000000");

const ADDRESS_RECEIVER_ONE = "0x56535d1162011e54aa2f6b003d02db171c17e41e";
const ADDRESS_RECEIVER_TWO = "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e";

const encodeMultisendData = async (
  client: PolywrapClient,
  receivers: string[]
) => {
  const [receiverOne, receiverTwo] = receivers;
  const safeTokenBalance = await client.invoke({
    uri: ETHERS_CORE_WRAPPER_URI,
    method: "callContractView",
    args: {
      address: ERC20_ADDRESS,
      method:
        "function getBalance(address account) public view returns (uint256)",
      args: [SAFE_ADDRESS],
      connection: CONNECTION,
    },
  });
  if (!safeTokenBalance.ok) throw safeTokenBalance.error;

  //@ts-ignore
  if (AMOUNT_TO_TRANSFER.gt(safeTokenBalance.value)) {
    const mint = await client.invoke({
      uri: ETHERS_CORE_WRAPPER_URI,
      method: "callContractMethodAndWait",
      args: {
        address: ERC20_ADDRESS,
        method: "function mint(address to, uint256 amount) public",
        args: [SAFE_ADDRESS, AMOUNT_TO_TRANSFER.toString()],
        connection: CONNECTION,
      },
    });
    if (!mint.ok) throw mint.error;
  }

  const encodeSendToReceiverOne = await client.invoke({
    uri: ETHERS_UTILS_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method:
        "function transfer(address from, address to, uint256 amount) public",
      args: [SAFE_ADDRESS, receiverOne, AMOUNT_TO_TRANSFER.div(2).toString()],
    },
  });
  if (!encodeSendToReceiverOne.ok) throw encodeSendToReceiverOne.error;

  const encodeSendToReceiverTwo = await client.invoke({
    uri: ETHERS_UTILS_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method:
        "function transfer(address from, address to, uint256 amount) public",
      args: [SAFE_ADDRESS, receiverTwo, AMOUNT_TO_TRANSFER.div(2).toString()],
    },
  });
  if (!encodeSendToReceiverTwo.ok) throw encodeSendToReceiverTwo.error;

  const safeTransactionData = [
    {
      to: ERC20_ADDRESS,
      value: "0",
      data: encodeSendToReceiverOne.value,
    },
    {
      to: ERC20_ADDRESS,
      value: "0",
      data: encodeSendToReceiverTwo.value,
    },
  ];

  const multisendTx = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createMultiSendTransaction",
    args: {
      txs: safeTransactionData,
    },
  });
  if (!multisendTx.ok) throw multisendTx.error;

  return multisendTx.value as string;
};

const main = async () => {
  const clientWithOwnerOne = getClient();
  const clientWithOwnerTwo = getClient(OWNER_TWO_PRIVATE_KEY);
  console.log("encoding multisend...");
  const transaction = await encodeMultisendData(clientWithOwnerOne, [
    ADDRESS_RECEIVER_ONE,
    ADDRESS_RECEIVER_TWO,
  ]);
  console.log("adding signatures...");

  const ownerOneSignedTx = await clientWithOwnerOne.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction,
    },
  });
  if (!ownerOneSignedTx.ok) throw ownerOneSignedTx.error;

  const ownerTwoSignedTx = await clientWithOwnerTwo.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: ownerOneSignedTx.value,
    },
  });
  if (!ownerTwoSignedTx.ok) throw ownerTwoSignedTx.error;

  // @TODO: This transaction doesn't work with if this is invoked
  // with the `client` variable, throwing a GS026 error, not sure why
  const executeTransaction = await clientWithOwnerTwo.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: ownerTwoSignedTx.value,
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
