use std::{convert::TryFrom, env};

use lazy_static::lazy_static;
use polywrap_client::{
    core::uri::Uri,
    plugin::JSON::{json, Value},
};

lazy_static! {
    pub static ref ETHERS_CORE_WRAPPER_URI: Uri =
        Uri::try_from("ens/ethers.wraps.eth:0.1.0").unwrap();
    pub static ref ETHERS_UTILS_WRAPPER_URI: Uri =
        Uri::try_from("wrap://ens/ethers.wraps.eth:utils@0.1.1").unwrap();
    pub static ref SAFE_MANAGER_URI: Uri =
        Uri::try_from("wrap://ens/safe.wraps.eth:manager@0.1.0").unwrap();
    pub static ref SAFE_FACTORY_URI: Uri =
        Uri::try_from("wrap://ens/safe.wraps.eth:factory@0.1.0").unwrap();
    pub static ref SAFE_CONTRACTS_URI: Uri =
        Uri::try_from("wrap://ens/safe.wraps.eth:contracts@0.1.0").unwrap();
    pub static ref RELAYER_ADAPTER_WRAPPER_URI: Uri =
        Uri::try_from("wrap://ens/aa.wraps.eth:relayer-adapter@0.0.1").unwrap();
    pub static ref ACCOUNT_ABSTRACTION_WRAPPER_URI: Uri =
        Uri::try_from("wrap://ens/aa.wraps.eth:core@0.1.0").unwrap();
    pub static ref GELATO_RELAYER_WRAPPER_URI: Uri =
        Uri::try_from("wrap://ens/gelato.wraps.eth:relayer@0.0.1").unwrap();
    pub static ref NETWORK: String = String::from("goerli");
    pub static ref CONNECTION: Value = json!({
        "networkNameOrChainId": *NETWORK
    });
    pub static ref SAFE_ADDRESS: String = {
        dotenv::from_path("../.env").ok();
        env::var("SAFE_ADDRESS")
            .unwrap_or_else(|_| "0xcbd78854fd17c37a6168ac77ddeee63914fa3222".to_string())
    };
    pub static ref OWNER_ONE_PRIVATE_KEY: String = {
        dotenv::from_path("../.env").ok();
        env::var("OWNER_ONE_PRIVATE_KEY").unwrap_or_else(|_| {
            "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d".to_string()
        })
    };
    pub static ref OWNER_TWO_PRIVATE_KEY: String = {
        dotenv::from_path("../.env").ok();
        env::var("OWNER_TWO_PRIVATE_KEY").unwrap_or_else(|_| {
            "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1".to_string()
        })
    };
}
