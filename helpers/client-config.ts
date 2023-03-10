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
} from "@cbrazon/ethereum-provider-js";
import { dateTimePlugin } from "@polywrap/datetime-plugin-js";
import { Wallet } from "ethers";

export const SAFE_CONTRACTS_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:contracts@0.0.1"
);
export const SAFE_FACTORY_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:factory@0.0.1"
);
export const SAFE_MANAGER_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:manager@0.0.1"
);

export const getClient = (
  signer = new Wallet(process.env.PRIVATE_KEY as string)
) => {
  const builder = new ClientConfigBuilder();
  builder
    .addDefaults()
    .addPackages({
      "wrap://plugin/ethereum-provider@1.1.0": ethereumProviderPlugin({
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
      safeAddress: "0x1bb36e33c17950c1ebe1b17ed7701fc4fe44d9c5",
      connection: {
        networkNameOrChainId: "goerli"
      }
    })
    .addRedirect(
      SAFE_CONTRACTS_URI.uri,
      "wrap://ipfs/QmVZo8xKbbx9aFJxGMfbmhLucBjJGKvT8LPuJTericEWou"
    )
    .addRedirect(
      SAFE_FACTORY_URI.uri,
      "wrap://ipfs/QmVMoA8saxEgcJEinSV2xajfsxmetHijZ8sex4QYogJCwu"
    )
    .addRedirect(
      SAFE_MANAGER_URI.uri,
      "wrap://ipfs/QmeZgbvqn1H86LFyygokuxLeHwUexNvDUn19MsDzUftwGY"
    )
    .addRedirect(
      "wrap://ens/wraps.eth:ethereum-utils@0.0.1",
      "wrap://ipfs/QmcqHPQoYfBYjZtofK1beazZDubhnJ9dgxdAGxjuaJyYC3"
    )
    .addRedirect(
      "ens/wraps.eth:ethereum@1.1.0",
      "wrap://ipfs/QmVh96rJCfCPUbZCwt4SqHcb8tsysVZjJ2iUYA3Ud2uRuc"
    )
    .addInterfaceImplementation(
      "wrap://ens/wraps.eth:ethereum-provider@1.1.0",
      "wrap://plugin/ethereum-provider@1.1.0"
    );
  return new PolywrapClient(builder.build());
};
