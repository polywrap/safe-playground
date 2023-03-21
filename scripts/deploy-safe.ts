import {
  ETHEREUM_WRAPPER_URI,
  getClient,
  SAFE_FACTORY_URI,
} from "../helpers/client-config";
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

  // Get signed address
  const signerAddress = await client.invoke({
    uri: ETHEREUM_WRAPPER_URI,
    method: "getSignerAddress",
    args: {
      connection,
    },
  });

  if (!signerAddress.ok) throw signerAddress.error;
  console.log(`Signer address: ${signerAddress.value}`);

  const deploymentInput = {
    input: {
      safeAccountConfig: {
        owners: [signerAddress.value],
        threshold: 1,
      },
      safeDeploymentConfig: {
        saltNonce: "0x999999",
      },
      connection,
    },
  };
  const expectedSafeAddress = await client.invoke({
    uri: SAFE_FACTORY_URI,
    method: "predictSafeAddress",
    args: deploymentInput,
  });
  if (!expectedSafeAddress.ok) throw expectedSafeAddress.error;
  console.log(`Expected safe address: ${expectedSafeAddress.value}`);

  const deploySafe = await client.invoke({
    uri: SAFE_FACTORY_URI,
    method: "deploySafe",
    args: deploymentInput,
  });
  if (!deploySafe.ok) throw deploySafe.error;

  console.log(deploySafe);
};

main().then();
