extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use polywrap_client::msgpack::to_vec;
use safe_rust_playground::{
    constants::ETHERS_CORE_WRAPPER_URI, helpers::get_client, AccountConfig, DeploymentArgs,
    DeploymentConfig, DeploymentInput, SchemaConnection, NETWORK, SAFE_FACTORY_URI,
};
use serde::Serialize;

#[derive(Serialize)]
struct GetSignerAddressArgs {
    connection: Option<SchemaConnection>,
}

fn main() {
    let client = get_client(None);
    println!("Getting signer address...");
    let signer_address: Result<String, polywrap_client::core::error::Error> = client
        .invoke::<String>(
            &ETHERS_CORE_WRAPPER_URI.clone(),
            "getSignerAddress",
            Some(
                &to_vec(&GetSignerAddressArgs {
                    connection: Some(SchemaConnection {
                        network_name_or_chain_id: Some(NETWORK.clone()),
                        node: None,
                    }),
                })
                .unwrap(),
            ),
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
            safe_deployment_config: Some(DeploymentConfig {
                salt_nonce: "0x94".to_string(),
            }),
            connection: Some(SchemaConnection {
                network_name_or_chain_id: Some(NETWORK.clone()),
                node: None,
            }),
        },
    };

    let expected_safe_address = client.invoke::<String>(
        &SAFE_FACTORY_URI.clone(),
        "predictSafeAddress",
        Some(&to_vec(&deployment_input).unwrap()),
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
        Some(&to_vec(&deployment_input).unwrap()),
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
