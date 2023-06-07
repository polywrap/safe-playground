use std::{collections::HashMap, convert::TryFrom, env, sync::Arc};

use super::dependencies::{
    account_abstraction::{
        core::wasm_wrapper as account_abstraction_core_wrapper,
        relay::wasm_wrapper as account_abstraction_relay_wrapper,
    },
    ethers::{
        core::wasm_wrapper as ethers_core_wrapper, utils::wasm_wrapper as ethers_utils_wrapper,
    },
    gelato_relayer::wasm_wrapper as gelato_relayer_wrapper,
    safe::{
        core::wasm_wrapper as safe_contracts_wrapper,
        factory::wasm_wrapper as safe_factory_wrapper,
        manager::wasm_wrapper as safe_manager_wrapper,
    },
};
use crate::{
    constants::{
        ACCOUNT_ABSTRACTION_WRAPPER_URI, ETHERS_CORE_WRAPPER_URI, ETHERS_UTILS_WRAPPER_URI,
        GELATO_RELAYER_WRAPPER_URI, NETWORK, RELAYER_ADAPTER_WRAPPER_URI, SAFE_CONTRACTS_URI,
        SAFE_FACTORY_URI, SAFE_MANAGER_URI,
    },
    OWNER_ONE_PRIVATE_KEY,
};
use polywrap_client::{
    builder::types::{ClientBuilder, ClientConfigHandler},
    client::PolywrapClient,
    core::uri::Uri,
    plugin::package::PluginPackage,
};
use polywrap_client_default_config::build;
use polywrap_datetime_plugin::DatetimePlugin;
use polywrap_ethereum_wallet_plugin::{
    connection::Connection, connections::Connections, EthereumWalletPlugin,
};

pub fn get_client(private_key: Option<String>) -> PolywrapClient {
    dotenv::from_path("../.env").ok();
    let mut builder = build();

    let signer = if let Some(s) = private_key {
        s
    } else {
        OWNER_ONE_PRIVATE_KEY.clone()
    };

    let url = env::var("RPC_URL").unwrap_or_else(|_| NETWORK.to_string());
    let connection = Connection::new(url, Some(signer)).unwrap();
    let connections = Connections::new(
        HashMap::from([(NETWORK.to_string(), connection)]),
        Some(NETWORK.to_string()),
    );

    let wallet_plugin = EthereumWalletPlugin::new(connections);
    let plugin_pkg: PluginPackage = wallet_plugin.into();
    let ethers_wallet_package = Arc::new(plugin_pkg);

    let datetime_plugin = DatetimePlugin {};
    let plugin_pkg: PluginPackage = datetime_plugin.into();
    let datetime_package = Arc::new(plugin_pkg);

    builder.add_packages(vec![
        (
            Uri::try_from("wrap://ens/wraps.eth:ethereum-provider@2.0.0").unwrap(),
            ethers_wallet_package,
        ),
        (
            Uri::try_from("wrap://ens/datetime.polywrap.eth").unwrap(),
            datetime_package,
        ),
    ]);

    builder.add_wrappers(vec![
        (
            ETHERS_CORE_WRAPPER_URI.clone(),
            Arc::new(ethers_core_wrapper()),
        ),
        (
            ETHERS_UTILS_WRAPPER_URI.clone(),
            Arc::new(ethers_utils_wrapper()),
        ),
        (
            ACCOUNT_ABSTRACTION_WRAPPER_URI.clone(),
            Arc::new(account_abstraction_core_wrapper()),
        ),
        (
            RELAYER_ADAPTER_WRAPPER_URI.clone(),
            Arc::new(account_abstraction_relay_wrapper()),
        ),
        (
            SAFE_CONTRACTS_URI.clone(),
            Arc::new(safe_contracts_wrapper()),
        ),
        (SAFE_FACTORY_URI.clone(), Arc::new(safe_factory_wrapper())),
        (SAFE_MANAGER_URI.clone(), Arc::new(safe_manager_wrapper())),
        (
            GELATO_RELAYER_WRAPPER_URI.clone(),
            Arc::new(gelato_relayer_wrapper()),
        ),
    ]);

    PolywrapClient::new(builder.build())
}
