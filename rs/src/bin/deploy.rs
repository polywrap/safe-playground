extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use polywrap_client::msgpack::serialize;
use safe_rust_playground::{
    constants::ETHERS_CORE_WRAPPER_URI, helpers::get_client, SAFE_FACTORY_URI,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
struct Connection {
    #[serde(rename = "networkNameOrChainId")]
    pub network_name_or_chain_id: Option<String>,
    pub node: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct AccountConfig {
    owners: Vec<String>,
    threshold: u32,
}

#[derive(Serialize, Deserialize)]
struct DeploymentConfig {
    #[serde(rename = "saltNonce")]
    salt_nonce: String,
}

#[derive(Serialize, Deserialize)]
struct DeploymentInput {
    #[serde(rename = "safeAccountConfig")]
    safe_account_config: AccountConfig,
    #[serde(rename = "safeDeploymentConfig")]
    safe_deployment_config: DeploymentConfig,
    connection: Option<Connection>,
}

#[derive(Serialize, Deserialize)]
struct DeploymentArgs {
    input: DeploymentInput,
}

fn main() {
    println!("Getting client");
    let client = get_client(None);
    println!("Client received!");
    println!("Getting signer address...");
    let signer_address: Result<String, polywrap_client::core::error::Error> = client
        .invoke::<String>(
            &ETHERS_CORE_WRAPPER_URI.clone(),
            "getSignerAddress",
            None,
            None,
            None,
        );

    if signer_address.is_err() {
        panic!("Error fetching signer address")
    }

    println!("Address of the signer: {}", signer_address.clone().unwrap());

    let deployment_input = DeploymentArgs {
        input: DeploymentInput {
            safe_account_config: AccountConfig {
                owners: vec![signer_address.unwrap()],
                threshold: 1,
            },
            safe_deployment_config: DeploymentConfig {
                salt_nonce: "0x888444777".to_string(),
            },
            connection: None,
        },
    };

    let expected_safe_address = client.invoke::<String>(
        &SAFE_FACTORY_URI.clone(),
        "predictSafeAddress",
        Some(&serialize(&deployment_input).unwrap()),
        None,
        None,
    );

    if expected_safe_address.is_err() {
        panic!(
            "Error predicting safe address: {}",
            expected_safe_address.unwrap_err().to_string()
        )
    }
    println!("Expected safe address: {}", expected_safe_address.unwrap());

    let deploy_safe = client.invoke::<String>(
        &SAFE_FACTORY_URI.clone(),
        "deploySafe",
        Some(&serialize(&deployment_input).unwrap()),
        None,
        None,
    );

    if deploy_safe.is_err() {
        panic!(
            "Error deploying safe: {}",
            deploy_safe.unwrap_err().to_string()
        )
    }
    println!("Safe deployed in address: {}", deploy_safe.unwrap());
}
