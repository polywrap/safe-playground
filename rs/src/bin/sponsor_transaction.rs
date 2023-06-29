extern crate num_bigint;
extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use std::{ops::Add, str::FromStr};

use num_bigint::BigInt;
use polywrap_client::msgpack::to_vec;
use safe_rust_playground::{
    helpers::get_client, EncodeFunctionArgs, EstimateTransactionGasArgs, GetEstimateFeeArgs,
    MetaTransactionData, MetaTransactionOptions, RelayTransactionArgs, SponsorDeploymentConfig,
    ToEthArgs, Transaction, ACCOUNT_ABSTRACTION_WRAPPER_URI, ETHERS_CORE_WRAPPER_URI,
    ETHERS_UTILS_WRAPPER_URI, RELAYER_ADAPTER_WRAPPER_URI,
};

const SALT_NONCE: &str = "0x255544";

fn main() {
    let client = get_client(None);

    let encoded_transaction = client.invoke::<String>(
        &ETHERS_UTILS_WRAPPER_URI,
        "encodeFunction",
        Some(
            &to_vec(&EncodeFunctionArgs {
                method: String::from("function store(uint256 num) public"),
                args: Vec::from(["10".to_string()]),
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
        to: "0x56535D1162011E54aa2F6B003d02Db171c17e41e".to_string(),
        value: "0".to_string(),
        data: encoded_transaction.clone().unwrap(),
        operation: Some("0".to_string()),
    };

    let gas_limit = client.invoke::<String>(
        &ETHERS_CORE_WRAPPER_URI,
        "estimateTransactionGas",
        Some(
            &to_vec(&EstimateTransactionGasArgs {
                tx: Transaction {
                    data: meta_transaction_data.data.clone(),
                    to: meta_transaction_data.to.clone(),
                    value: meta_transaction_data.value.clone(),
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
            &to_vec(&GetEstimateFeeArgs {
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
            &to_vec(&ToEthArgs {
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

    println!("Fee estimation: {} ETH", estimation_in_eth.unwrap());
    println!("Relaying sponsored transaction...");

    let execute_transaction = client.invoke::<String>(
        &ACCOUNT_ABSTRACTION_WRAPPER_URI,
        "relayTransaction",
        Some(
            &to_vec(&RelayTransactionArgs {
                transaction: meta_transaction_data,
                options: MetaTransactionOptions {
                    gas_limit: gas_limit_with_buffer.to_string(),
                    is_sponsored: Some(true),
                    gas_token: None,
                },
                config: Some(SponsorDeploymentConfig {
                    salt_nonce: Some(SALT_NONCE.to_string()),
                }),
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
