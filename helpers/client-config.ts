import {
  PolywrapClient,
  ClientConfigBuilder,
  IWrapPackage,
} from "@polywrap/client-js";
import {
  Connections,
  Connection,
  ethereumProviderPlugin,
} from "@polywrap/ethereum-provider-js";
import { dateTimePlugin } from "@polywrap/datetime-plugin-js";
import { Wallet } from "ethers";
import {
  OWNER_ONE_PRIVATE_KEY,
  SAFE_ADDRESS,
  SAFE_MANAGER_URI,
} from "./constants";

const connection = {
  networkNameOrChainId: "goerli",
};

export const getClient = (
  privateKey = OWNER_ONE_PRIVATE_KEY,
  builderConfigFn?: (builder: ClientConfigBuilder) => void
) => {
  const signer = new Wallet(privateKey);
  const builder = new ClientConfigBuilder();

  const provider = process.env.RPC_URL || connection.networkNameOrChainId;

  builder
    .addDefaults()
    .addPackages({
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0": ethereumProviderPlugin({
        connections: new Connections({
          networks: {
            goerli: new Connection({
              provider,
              signer,
            }),
          },
          defaultNetwork: "goerli",
        }),
      }) as IWrapPackage,
      "wrap://ens/datetime.polywrap.eth": dateTimePlugin({}) as IWrapPackage,
    })
    .addEnv(SAFE_MANAGER_URI.uri, {
      safeAddress: SAFE_ADDRESS,
      connection,
    })
    .addInterfaceImplementation(
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0",
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0"
    );

  if (builderConfigFn) {
    builderConfigFn(builder);
  }

  return new PolywrapClient(builder.build());
};
