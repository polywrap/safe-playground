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
  ACCOUNT_ABSTRACTION_WRAPPER_URI,
  CONNECTION,
  GELATO_RELAYER_WRAPPER_URI,
  NETWORK,
  OWNER_ONE_PRIVATE_KEY,
  RELAYER_ADAPTER_WRAPPER_URI,
  SAFE_ADDRESS,
  SAFE_MANAGER_URI,
} from "./constants";

export const getClient = (privateKey = OWNER_ONE_PRIVATE_KEY) => {
  const signer = new Wallet(privateKey);
  const builder = new ClientConfigBuilder();

  const provider = process.env.RPC_URL || NETWORK;

  builder
    .addDefaults()
    .addPackages({
      "wrap://ens/wraps.eth:ethereum-provider@2.0.0": ethereumProviderPlugin({
        connections: new Connections({
          networks: {
            [NETWORK]: new Connection({
              provider,
              signer,
            }),
          },
          defaultNetwork: NETWORK,
        }),
      }),
      "wrap://ens/datetime.polywrap.eth": dateTimePlugin({}) as IWrapPackage,
    })
    .addEnv(SAFE_MANAGER_URI.uri, {
      safeAddress: SAFE_ADDRESS,
      connection: CONNECTION,
    })
    .addEnv(ACCOUNT_ABSTRACTION_WRAPPER_URI.uri, {
      connection: CONNECTION,
    })
    .addEnv(RELAYER_ADAPTER_WRAPPER_URI.uri, {
      relayerApiKey: "AiaCshYRyAUzTNfZZb8LftJaAl2SS3I8YwhJJXc5J7A_",
    })
    .addRedirects({
      [ACCOUNT_ABSTRACTION_WRAPPER_URI.uri]: `fs/${__dirname}/../../wrap-dependencies/account-abstraction/core`,
      [RELAYER_ADAPTER_WRAPPER_URI.uri]: `fs/${__dirname}/../../wrap-dependencies/account-abstraction/relay`,
      [GELATO_RELAYER_WRAPPER_URI.uri]: `fs/${__dirname}/../../wrap-dependencies/gelato-relayer`,
    });

  return new PolywrapClient(builder.build());
};
