import { getClient, SAFE_MANAGER_URI } from "../../helpers/client-config";
import { config } from "dotenv";
config();

const connection = {
  networkNameOrChainId: "goerli",
};

const SAFE_ADDRESS = "0x5655294c49e7196c21f20551330c2204db2bd670"

const main = async () => {
  if (!process.env.RPC_URL) {
    throw new Error(
      "You must define a RPC URL in the .env file. See .example.env"
    );
  }

  const client = getClient();

  const owners = await client.invoke({
    uri: SAFE_MANAGER_URI,
    method: "getOwners",
    env: {
        safeAddress: SAFE_ADDRESS,
        connection
    }
  })
  if (!owners.ok) throw owners.error;
  console.log(`Owners of safe: ${owners.value}`)
};

main().then();
