import { BigNumber } from "ethers";
import { getClient } from "../helpers/client-config";
import {
  ACCOUNT_ABSTRACTION_WRAPPER_URI,
  CONNECTION,
  ETHERS_CORE_WRAPPER_URI,
  ETHERS_UTILS_WRAPPER_URI,
  OWNER_ONE_PRIVATE_KEY,
  RELAYER_ADAPTER_WRAPPER_URI,
} from "../helpers/constants";

const saltNonce = "0x252387282";

const main = async () => {
  const client = getClient(OWNER_ONE_PRIVATE_KEY);

  const encodedFunction = await client.invoke({
    uri: ETHERS_UTILS_WRAPPER_URI,
    method: "encodeFunction",
    args: {
      method: "function store(uint256 num) public",
      args: ["7"],
    },
  });

  if (!encodedFunction.ok) throw encodedFunction.error;

  const metaTransactionData = {
    to: "0x56535D1162011E54aa2F6B003d02Db171c17e41e",
    value: "0",
    data: encodedFunction.value,
    operation: "0",
  };

  const gasLimit = await client.invoke({
    uri: ETHERS_CORE_WRAPPER_URI,
    method: "estimateTransactionGas",
    args: {
      tx: {
        to: metaTransactionData.to,
        value: metaTransactionData.value,
        data: metaTransactionData.data,
      },
    },
  });

  if (!gasLimit.ok) throw gasLimit.error;

  const gaslimitWithBuffer = BigNumber.from(gasLimit.value)
    .add(250_000)
    .toString();

  const estimation = await client.invoke({
    uri: RELAYER_ADAPTER_WRAPPER_URI,
    method: "getEstimateFee",
    args: {
      chainId: 5,
      gasLimit: gaslimitWithBuffer,
    },
  });

  if (!estimation.ok) throw estimation.error;

  const safeAddress = await client.invoke({
    uri: ACCOUNT_ABSTRACTION_WRAPPER_URI,
    method: "getSafeAddress",
    args: {
      config: {
        saltNonce,
      },
    },
  });

  if (!safeAddress.ok) throw safeAddress.error;

  console.log("Predicted safe address: ", safeAddress.value);

  const safeBalance = await client.invoke({
    uri: ETHERS_CORE_WRAPPER_URI,
    method: "getBalance",
    args: {
      address: safeAddress.value,
      connection: CONNECTION,
    },
  });

  if (!safeBalance.ok) throw safeBalance.error;

  const estimationInEth = await client.invoke({
    uri: ETHERS_UTILS_WRAPPER_URI,
    method: "toEth",
    args: {
      wei: estimation.value,
    },
  });

  if (!estimationInEth.ok) throw estimationInEth.error;
  console.log(`Fee estimation: ${estimationInEth.value} ETH`);

  const metaTransactionOptions = {
    gasLimit: gaslimitWithBuffer,
    isSponsored: true,
  };

  console.log("Relaying sponsored transaction...");

  const result = await client.invoke({
    uri: ACCOUNT_ABSTRACTION_WRAPPER_URI,
    method: "relayTransaction",
    args: {
      transaction: metaTransactionData,
      options: metaTransactionOptions,
      config: {
        saltNonce,
      },
    },
  });

  if (!result.ok) throw result.error;

  console.log("Transaction has been relayed...");
  console.log(
    `Task URL: https://relay.gelato.digital/tasks/status/${result.value}`
  );
};

main().then();
