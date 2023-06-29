use std::{collections::HashMap, convert::TryFrom, env, sync::Arc};

use crate::{
    constants::{
        ACCOUNT_ABSTRACTION_WRAPPER_URI, ETHERS_CORE_WRAPPER_URI, ETHERS_UTILS_WRAPPER_URI,
        GELATO_RELAYER_WRAPPER_URI, NETWORK, RELAYER_ADAPTER_WRAPPER_URI, SAFE_CONTRACTS_URI,
        SAFE_FACTORY_URI, SAFE_MANAGER_URI,
    },
    AccountAbstractionEnv, RelayerAdapterEnv, SafeManagerEnv, SchemaConnection,
    OWNER_ONE_PRIVATE_KEY, SAFE_ADDRESS,
};
use polywrap_client::{
    builder::{PolywrapClientConfig, PolywrapClientConfigBuilder},
    client::PolywrapClient,
    core::{client::ClientConfigBuilder, uri::Uri},
    msgpack::to_vec,
    plugin::package::PluginPackage,
};
use polywrap_client_default_config::SystemClientConfig;
use polywrap_datetime_plugin::DatetimePlugin;
use polywrap_ethereum_wallet_plugin::{
    connection::Connection, connections::Connections, EthereumWalletPlugin,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct GetOwnersArgs {}

pub fn get_client(private_key: Option<String>) -> PolywrapClient {
    dotenv::from_path("../.env").ok();
    let mut config = PolywrapClientConfig::new();
    config.add(SystemClientConfig::default().into());

    let schema_connection = SchemaConnection {
        network_name_or_chain_id: Some(NETWORK.clone()),
        node: None,
    };

    let signer = if let Some(s) = private_key {
        s
    } else {
        OWNER_ONE_PRIVATE_KEY.clone()
    };

    let url = env::var("RPC_URL").unwrap_or_else(|_| {
        "https://goerli.infura.io/v3/41fbecf847994df5a9652b1210effd8a".to_string()
    });

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

    config.add_packages(vec![
        (
            Uri::try_from("wrap://ens/wraps.eth:ethereum-provider@2.0.0").unwrap(),
            ethers_wallet_package,
        ),
        (
            Uri::try_from("wrap://ens/datetime.polywrap.eth").unwrap(),
            datetime_package,
        ),
    ]);

    config.add_envs(HashMap::from([
        (
            SAFE_MANAGER_URI.clone(),
            to_vec(&SafeManagerEnv {
                connection: schema_connection.clone(),
                safe_address: SAFE_ADDRESS.clone(),
            })
            .unwrap(),
        ),
        (
            RELAYER_ADAPTER_WRAPPER_URI.clone(),
            to_vec(&RelayerAdapterEnv {
                relayer_api_key: "AiaCshYRyAUzTNfZZb8LftJaAl2SS3I8YwhJJXc5J7A_".to_string(),
            })
            .unwrap(),
        ),
        (
            ACCOUNT_ABSTRACTION_WRAPPER_URI.clone(),
            to_vec(&AccountAbstractionEnv {
                connection: schema_connection,
            })
            .unwrap(),
        ),
    ]));

    config.add_redirects(HashMap::from([
        (
            Uri::try_from("wrap://ens/datetime.polywrap.eth").unwrap(),
            Uri::try_from("wrap://plugin/datetime").unwrap(),
        ),
        (
            GELATO_RELAYER_WRAPPER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/gelato-relayer").unwrap(),
        ),
        (
            SAFE_MANAGER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/safe/manager").unwrap(),
        ),
        (
            SAFE_CONTRACTS_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/safe/core").unwrap(),
        ),
        (
            SAFE_FACTORY_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/safe/factory").unwrap(),
        ),
        (
            ETHERS_CORE_WRAPPER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/ethers/core").unwrap(),
        ),
        (
            ETHERS_UTILS_WRAPPER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/ethers/utils").unwrap(),
        ),
        (
            ACCOUNT_ABSTRACTION_WRAPPER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/account-abstraction/core").unwrap(),
        ),
        (
            RELAYER_ADAPTER_WRAPPER_URI.clone(),
            Uri::try_from("fs/../wrap-dependencies/account-abstraction/relay").unwrap(),
        ),
    ]));

    PolywrapClient::new(config.build())
}
