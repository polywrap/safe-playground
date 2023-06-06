import { getClient } from "../helpers/client-config";
import { CONNECTION, ETHERS_CORE_WRAPPER_URI, SAFE_FACTORY_URI } from "../helpers/constants";

const SALT_NONCE = "0x18558"

const main = async () => {
  const client = getClient();

  // Get signer address
  const signerAddress = await client.invoke({
    uri: ETHERS_CORE_WRAPPER_URI,
    method: "getSignerAddress",
    args: {
      connection: CONNECTION,
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
        saltNonce: SALT_NONCE,
      },
      connection: CONNECTION,
    },
  };

  const expectedSafeAddress = await client.invoke({
    uri: SAFE_FACTORY_URI,
    method: "predictSafeAddress",
    args: deploymentInput,
  });
  if (!expectedSafeAddress.ok) throw expectedSafeAddress.error;
  console.log(`Expected safe address: ${expectedSafeAddress.value}`);


  console.log("Deploying safe...")


  const deploySafe = await client.invoke({
    uri: SAFE_FACTORY_URI,
    method: "deploySafe",
    args: deploymentInput,
  });
  if (!deploySafe.ok) throw deploySafe.error;


  console.log(`Safe deployed to address: ${deploySafe.value}`);
};

main().then();
