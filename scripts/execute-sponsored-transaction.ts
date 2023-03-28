import { BigNumber } from "ethers";
import { getClient } from "../helpers/client-config";
import { OWNER_ONE_PRIVATE_KEY } from "../helpers/constants";

const saltNonce = "0x258802387238728372837283782";
const connection = {
  networkNameOrChainId: "goerli",
};

const etherUtilsWrapperUri = "wrap://ens/ethers.wraps.eth:utils@0.1.0";
const etherCoreWrapperUri = "wrap://ens/wraps.eth:ethereum@2.0.0";
const relayerAdapterWrapperUri =
  "wrap://ens/account-abstraction.wraps.eth:relayer-adapter@0.0.1";
const accountAbstractionWrapperUri = "wrap://wrapper/account-abstraction";
const accountAbstractionWrapperFsUri = `fs/./wrap-build-artifacts/account-abstraction`;

const main = async () => {
  const client = getClient(OWNER_ONE_PRIVATE_KEY, (builder) => {
    builder
      .addEnv(accountAbstractionWrapperUri, {
        connection,
      })
      .addEnv(relayerAdapterWrapperUri, {
        relayerApiKey: "AiaCshYRyAUzTNfZZb8LftJaAl2SS3I8YwhJJXc5J7A_",
      })
      .addRedirect(
        accountAbstractionWrapperUri,
        accountAbstractionWrapperFsUri
      )
      .addRedirect(
        etherCoreWrapperUri,
        "wrap://ipfs/QmUX4nafTqncmtucMSJGKVNB6WbEaRJLWJHMVMcZy751S9"
      )
      .addRedirect(
        relayerAdapterWrapperUri,
        "wrap://fs/./wrap-build-artifacts/relay"
      )
      .addRedirect(
        "wrap://ens/gelato.wraps.eth:relayer@0.0.1",
        "wrap://fs/./wrap-build-artifacts/gelato-relay"
      );
  });

  const encodedFunction = await client.invoke({
    uri: etherUtilsWrapperUri,
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
    uri: etherCoreWrapperUri,
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
    uri: relayerAdapterWrapperUri,
    method: "getEstimateFee",
    args: {
      chainId: 5,
      gasLimit: gaslimitWithBuffer,
    },
  });

  if (!estimation.ok) throw estimation.error;

  const safeAddress = await client.invoke({
    uri: accountAbstractionWrapperUri,
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
    uri: etherCoreWrapperUri,
    method: "getBalance",
    args: {
      address: safeAddress.value,
      connection,
    },
  });

  if (!safeBalance.ok) throw safeBalance.error;

  const estimationInEth = await client.invoke({
    uri: etherCoreWrapperUri,
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
    uri: accountAbstractionWrapperUri,
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