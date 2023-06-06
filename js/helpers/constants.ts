import { Uri } from "@polywrap/client-js";
import { config } from "dotenv";
config({ path: "../.env" });

export const SAFE_CONTRACTS_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:contracts@0.1.0"
);
export const SAFE_FACTORY_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:factory@0.1.0"
);
export const SAFE_MANAGER_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:manager@0.1.0"
);
export const ETHERS_CORE_WRAPPER_URI = Uri.from("ens/ethers.wraps.eth:0.1.0");
export const ETHERS_UTILS_WRAPPER_URI = Uri.from(
  "wrap://ens/ethers.wraps.eth:utils@0.1.1"
);
export const RELAYER_ADAPTER_WRAPPER_URI = Uri.from(
  "wrap://ens/account-abstraction.wraps.eth:relayer-adapter@0.0.1"
);
export const ACCOUNT_ABSTRACTION_WRAPPER_URI = Uri.from(
  "wrap://ens/wraps.eth:aa-core@0.1.0"
);
export const GELATO_RELAYER_WRAPPER_URI = Uri.from(
  "wrap://ens/gelato.wraps.eth:relayer@0.0.1"
);

export const SAFE_ADDRESS =
  process.env.SAFE_ADDRESS || "0xcbd78854fd17c37a6168ac77ddeee63914fa3222";
export const OWNER_ONE_PRIVATE_KEY =
  process.env.OWNER_ONE_PRIVATE_KEY ||
  "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
export const OWNER_TWO_PRIVATE_KEY =
  process.env.OWNER_TWO_PRIVATE_KEY ||
  "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1";

export const NETWORK = "goerli";
export const CONNECTION = {
  networkNameOrChainId: NETWORK,
};
