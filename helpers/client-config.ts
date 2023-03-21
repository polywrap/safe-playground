import {
  PolywrapClient,
  ClientConfigBuilder,
  IWrapPackage,
  Uri,
} from "@polywrap/client-js";
import {
  Connections,
  Connection,
  ethereumProviderPlugin,
} from "@polywrap/ethereum-provider-js";
import { dateTimePlugin } from "@polywrap/datetime-plugin-js";
import { Wallet } from "ethers";

export const SAFE_CONTRACTS_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:contracts@0.1.0"
);
export const SAFE_FACTORY_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:factory@0.1.0"
);
export const SAFE_MANAGER_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:manager@0.1.0"
);

export const ETHEREUM_WRAPPER_URI = Uri.from(
  "ens/wraps.eth:ethereum@2.0.0"
)

export const getClient = (
  signer = new Wallet(process.env.PRIVATE_KEY as string)
) => {
  const builder = new ClientConfigBuilder();
  builder
    .addDefaults()
    .addPackages({
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0": ethereumProviderPlugin({
        connections: new Connections({
          networks: {
            goerli: new Connection({
              provider: process.env.RPC_URL as string,
              signer,
            }),
          },
          defaultNetwork: "goerli",
        }),
      }) as IWrapPackage,
      "wrap://ens/datetime.polywrap.eth": dateTimePlugin({}) as IWrapPackage,
    })
    .addEnv(SAFE_MANAGER_URI.uri, {
      connection: {
        networkNameOrChainId: "goerli"
      }
    })
    .addInterfaceImplementation(
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0",
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0"
    );
  return new PolywrapClient(builder.build());
};
