import { getClient } from "../../helpers/client-config";
import { SAFE_MANAGER_URI } from "../../helpers/constants";

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
  })
  if (!owners.ok) throw owners.error;
  console.log(`Owners of safe: ${owners.value}`)
};

main().then();
