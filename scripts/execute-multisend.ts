import {
  ETHEREUM_WRAPPER_URI,
  getClient,
  SAFE_MANAGER_URI,
} from "../helpers/client-config";
import { config } from "dotenv";
import { BigNumber, Wallet } from "ethers";
import { PolywrapClient } from "@polywrap/client-js"
config();

const connection = {
  networkNameOrChainId: "goerli",
};

const ERC20_ADDRESS = "0xbC53a5E6E01b308b6A1BaC3d273990EF8837452d"
const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670";

const mockOwner = {
  signer: new Wallet(process.env.OWNER_TWO_PRIVATE_KEY as string),
  address: "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e",
};

const AMOUNT_TO_TRANSFER = BigNumber.from("100000000000000000000")

const encodeMultisendData = async (client: PolywrapClient, owners: string[]) => {
    const [ownerOne, ownerTwo] = owners;
    const safeTokenBalance = await client.invoke({
        uri: ETHEREUM_WRAPPER_URI,
        method: "callContractView",
        args: {
            address: ERC20_ADDRESS,
            method: "function getBalance(address account) public view returns (uint256)",
            args: [SAFE_ADDRESS],
            connection
        }
    })
    if (!safeTokenBalance.ok) throw safeTokenBalance.error;

    console.log(safeTokenBalance)
    //@ts-ignore
    if (AMOUNT_TO_TRANSFER.gt(safeTokenBalance.value)) {
        const mint = await client.invoke({
            uri: ETHEREUM_WRAPPER_URI,
            method: "callContractMethodAndWait",
            args: {
                address: ERC20_ADDRESS,
                method: "function mint(address to, uint256 amount) public",
                args: [SAFE_ADDRESS, AMOUNT_TO_TRANSFER.toString()],
                connection
            }
        })
        if (!mint.ok) throw mint.error;
    }

    const encodeSendToOwnerOne = await client.invoke({
        uri: ETHEREUM_WRAPPER_URI,
        method: "encodeFunction",
        args: {
            method: "function transfer(address from, address to, uint256 amount) public",
            args: [SAFE_ADDRESS, ownerOne, AMOUNT_TO_TRANSFER.div(2).toString()]
        }
    })
    if (!encodeSendToOwnerOne.ok) throw encodeSendToOwnerOne.error;

    const encodeSendToOwnerTwo = await client.invoke({
        uri: ETHEREUM_WRAPPER_URI,
        method: "encodeFunction",
        args: {
            method: "function transfer(address from, address to, uint256 amount) public",
            args: [SAFE_ADDRESS, ownerTwo, AMOUNT_TO_TRANSFER.div(2).toString()]
        }
    })
    if (!encodeSendToOwnerTwo.ok) throw encodeSendToOwnerTwo.error;

    const safeTransactionData = [
        {
            to: ERC20_ADDRESS,
            value: "0",
            data: encodeSendToOwnerOne.value
        },
        {
            to: ERC20_ADDRESS,
            value: "0",
            data: encodeSendToOwnerTwo.value
        }
    ]

    const multisendTx = await client.invoke({
        uri: SAFE_MANAGER_URI,
        method: "createMultiSendTransaction",
        args: {
            txs: safeTransactionData
        },
        env: {
            safeAddress: SAFE_ADDRESS,
            connection
        }
    })
    if (!multisendTx.ok) throw multisendTx.error;

    return multisendTx.value as string

}

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
  console.log("encoding multisend...")
  const transaction = await encodeMultisendData(client, ["0xAC39C85F4E54797e4909f70a302d9e11E428135D","0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e"])
  console.log("adding signatures...");

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
