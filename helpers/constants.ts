import { Uri } from "@polywrap/client-js";
import { config } from "dotenv"
config()

export const SAFE_CONTRACTS_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:contracts@0.1.0"
);
export const SAFE_FACTORY_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:factory@0.1.0"
);
export const SAFE_MANAGER_URI = Uri.from(
  "wrap://ens/safe.wraps.eth:manager@0.1.0"
);
export const ETHEREUM_WRAPPER_URI = Uri.from("ens/wraps.eth:ethereum@2.0.0");

export const SAFE_ADDRESS = process.env.SAFE_ADDRESS || "0x5655294c49e7196c21f20551330c2204db2bd670";
export const OWNER_ONE_PRIVATE_KEY = process.env.OWNER_ONE_PRIVATE_KEY || "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
export const OWNER_TWO_PRIVATE_KEY = process.env.OWNER_TWO_PRIVATE_KEY || "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1"

export const CONNECTION = {
    networkNameOrChainId: "goerli"
}