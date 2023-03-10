import { getClient, SAFE_MANAGER_URI } from "../helpers/client-config";
import { config } from "dotenv";
config();

const connection = {
  networkNameOrChainId: "goerli",
};

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

  const ethereumWrapperUri = "ens/wraps.eth:ethereum@1.1.0";
  const signerAddress = await client.invoke({
    uri: ethereumWrapperUri,
    method: "getSignerAddress",
    args: {
      connection,
    },
  });

  if (!signerAddress.ok) throw signerAddress.error;
  const valueToTransfer = "5000000000000000"; // 0.005 ETH

  // @TODO: check if safe exists, if not, deploy, then add it to env
  const safeAddress = "0x1bb36e33c17950c1ebe1b17ed7701fc4fe44d9c5";

  // @TODO: Check balance & transfer money to safe if necessary
  // Note: This should be modified eventually w/filling the relayer
  const transfer = await client.invoke({
    uri: ethereumWrapperUri,
    method: "sendTransactionAndwait",
    args: {
      tx: {
        to: safeAddress,
        value: valueToTransfer,
      },
    },
  });
  if (!transfer.ok) throw transfer.error;

  // Transaction to be send
  // @TODO: Create complex transactions 
  const txToExecute = {
    data: "0x",
    to: signerAddress.value,
    value: valueToTransfer,
    operation: "0",
    safeTxGas: "0",
    baseGas: "0",
    gasPrice: "0",
    gasToken: "0x0000000000000000000000000000000000000000",
    refundReceiver: "0x0000000000000000000000000000000000000000",
    nonce: "0",
  };

  const createTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "createTransaction",
    args: {
      tx: txToExecute,
    },
  });

  if (!createTransaction.ok) throw createTransaction.error;

  // @TODO: In this example, the safe has only one owner
  // this needs to be showed with multiple signers
  const transaction = createTransaction.value;
  const signedTxInvoke = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "addSignature",
    args: {
      tx: transaction,
    },
  });
  if (!signedTxInvoke.ok) throw signedTxInvoke.error;

  const signedTx = signedTxInvoke.value;
  const executeTransaction = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "executeTransaction",
    args: {
      tx: signedTx,
    },
  });

  console.log(executeTransaction);
};

main().then();
