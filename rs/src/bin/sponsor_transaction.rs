extern crate num_bigint;
extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use std::{ops::Add, str::FromStr};

use num_bigint::BigInt;
use polywrap_client::msgpack::serialize;
use safe_rust_playground::{
    helpers::get_client, DeploymentConfig, EncodeFunctionArgs, EstimateTransactionGasArgs,
    GetEstimateFeeArgs, GetSafeAddressArgs, MetaTransactionData, MetaTransactionOptions,
    RelayTransactionArgs, ToEthArgs, Transaction, ACCOUNT_ABSTRACTION_WRAPPER_URI,
    ETHERS_CORE_WRAPPER_URI, ETHERS_UTILS_WRAPPER_URI, RELAYER_ADAPTER_WRAPPER_URI,
};

const STORAGE_CONTRACT: &str = "0x57c94aa4a136506d3b88d84473bf3dc77f5b51da";
const NEW_STORED_NUMBER: &str = "19";
const SALT_NONCE: &str = "0x2588023387282";

fn main() {
    let client = get_client(None);

    let encoded_transaction = client.invoke::<String>(
        &ETHERS_UTILS_WRAPPER_URI,
        "encodeFunction",
        Some(
            &serialize(&EncodeFunctionArgs {
                method: String::from("function store(uint256 num) public"),
                args: Vec::from([NEW_STORED_NUMBER.to_string()]),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if encoded_transaction.is_err() {
        panic!(
            "Error encoding function: {}",
            encoded_transaction.clone().unwrap_err()
        )
    }

    let meta_transaction_data = MetaTransactionData {
        data: encoded_transaction.clone().unwrap(),
        to: STORAGE_CONTRACT.to_string(),
        value: "0".to_string(),
        operation: "0".to_string(),
    };

    let safe_address = client.invoke::<String>(
        &ACCOUNT_ABSTRACTION_WRAPPER_URI,
        "getSafeAddress",
        Some(
            &serialize(&GetSafeAddressArgs {
                config: DeploymentConfig {
                    salt_nonce: SALT_NONCE.clone().to_string(),
                },
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if safe_address.is_err() {
        panic!(
            "Error getting safe address: {}",
            safe_address.clone().unwrap_err()
        )
    }

    println!(
        "Predicted safe address: {:#?}",
        safe_address.clone().unwrap()
    );

    let gas_limit = client.invoke::<String>(
        &ETHERS_CORE_WRAPPER_URI,
        "estimateTransactionGas",
        Some(
            &serialize(&EstimateTransactionGasArgs {
                tx: Transaction {
                    data: encoded_transaction.clone().unwrap(),
                    to: STORAGE_CONTRACT.to_string(),
                    value: "0".to_string(),
                },
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if gas_limit.is_err() {
        panic!(
            "Error estimating gas limit: {}",
            gas_limit.clone().unwrap_err()
        )
    }

    let gas_limit_with_buffer = BigInt::from_str(&gas_limit.unwrap()).unwrap();
    let gas_limit_with_buffer = gas_limit_with_buffer.add(BigInt::from_str("250000").unwrap());

    let estimation = client.invoke::<String>(
        &RELAYER_ADAPTER_WRAPPER_URI,
        "getEstimateFee",
        Some(
            &serialize(&GetEstimateFeeArgs {
                chain_id: 5,
                gas_limit: gas_limit_with_buffer.clone().to_string(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if estimation.is_err() {
        panic!(
            "Error estimating transaction fee: {}",
            estimation.clone().unwrap_err()
        )
    }

    let estimation_in_eth = client.invoke::<String>(
        &ETHERS_UTILS_WRAPPER_URI,
        "toEth",
        Some(
            &serialize(&ToEthArgs {
                wei: estimation.unwrap(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if estimation_in_eth.is_err() {
        panic!(
            "Error coverting wei to eth: {}",
            estimation_in_eth.clone().unwrap_err()
        )
    }

    println!("Fee estimation: {}", estimation_in_eth.unwrap());
    println!("Relaying sponsored transaction...");

    let execute_transaction = client.invoke::<String>(
        &ACCOUNT_ABSTRACTION_WRAPPER_URI,
        "relayTransaction",
        Some(
            &serialize(&RelayTransactionArgs {
                transaction: meta_transaction_data,
                options: MetaTransactionOptions {
                    gas_limit: gas_limit_with_buffer.to_string(),
                    is_sponsored: true,
                },
                config: DeploymentConfig {
                    salt_nonce: SALT_NONCE.to_string(),
                },
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if execute_transaction.is_err() {
        panic!(
            "Error getting balance of safe: {}",
            execute_transaction.clone().unwrap_err()
        )
    }

    println!("Transaction has been relayed...");
    println!(
        "Task URL: https://relay.gelato.digital/tasks/status/{}",
        execute_transaction.unwrap()
    )
}
