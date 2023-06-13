extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use polywrap_client::{msgpack::serialize, plugin::Map};
use safe_rust_playground::{helpers::get_client, SAFE_ADDRESS, SAFE_MANAGER_URI};
use serde::{Deserialize, Serialize};

const OWNER_TO_BE_ADDED: &str = "0x0Ce3cC862b26FC643aA8A73D2D30d47EF791941e";

#[derive(Debug, Serialize, Deserialize)]
struct EncodeAddOwner {
    #[serde(rename = "ownerAddress")]
    owner_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateTransactionArgs {
    tx: Transaction,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExecuteTransactionArgs {
    tx: SafeTransaction,
}

#[derive(Debug, Serialize, Deserialize)]
struct AddSignatureArgs {
    tx: SafeTransaction,
    #[serde(rename = "signingMethod")]
    signing_method: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Transaction {
    to: String,
    data: String,
    value: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Log {
    pub block_number: String,
    pub block_hash: String,
    pub transaction_index: u32,
    pub removed: bool,
    pub address: String,
    pub data: String,
    pub topics: Vec<String>,
    pub transaction_hash: String,
    pub log_index: u32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TxReceipt {
    pub to: String,
    pub from: String,
    #[serde(rename = "contractAddress")]
    pub contract_address: String,
    #[serde(rename = "transactionIndex")]
    pub transaction_index: u32,
    pub root: Option<String>,
    #[serde(rename = "gasUsed")]
    pub gas_used: String,
    #[serde(rename = "logsBloom")]
    pub logs_bloom: String,
    #[serde(rename = "transactionHash")]
    pub transaction_hash: String,
    pub logs: Vec<Log>,
    #[serde(rename = "blockNumber")]
    pub block_number: String,
    #[serde(rename = "blockHash")]
    pub block_hash: String,
    pub confirmations: u32,
    #[serde(rename = "cumulativeGasUsed")]
    pub cumulative_gas_used: String,
    #[serde(rename = "effectiveGasPrice")]
    pub effective_gas_price: String,
    #[serde(rename = "type")]
    pub _type: u32,
    pub status: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SafeTransactionData {
    to: String,
    data: String,
    value: String,
    operation: String,
    #[serde(rename = "safeTxGas")]
    safe_tx_gas: String,
    #[serde(rename = "baseGas")]
    base_gas: String,
    #[serde(rename = "gasPrice")]
    gas_price: String,
    #[serde(rename = "gasToken")]
    gas_token: String,
    #[serde(rename = "refundReceiver")]
    refund_receiver: String,
    nonce: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SignSignature {
    signer: String,
    data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SafeTransaction {
    signatures: Option<Map<String, SignSignature>>,
    data: SafeTransactionData,
}

fn main() {
    let client = get_client(None);
    let owners =
        client.invoke::<Vec<String>>(&SAFE_MANAGER_URI.clone(), "getOwners", None, None, None);

    if owners.is_err() {
        panic!("Error fetching owners")
    }

    println!("Current owners of safe: {:#?}", owners.unwrap());

    let add_owner_encoded = client.invoke::<String>(
        &SAFE_MANAGER_URI,
        "encodeAddOwnerWithThresholdData",
        Some(
            &serialize(&EncodeAddOwner {
                owner_address: String::from(OWNER_TO_BE_ADDED),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if add_owner_encoded.is_err() {
        panic!("Error encoding owner: {:?}", add_owner_encoded.unwrap_err())
    }

    println!(
        "Add owner encoded: {:?}",
        add_owner_encoded.clone().unwrap()
    );

    let transaction = Transaction {
        to: SAFE_ADDRESS.clone(),
        data: add_owner_encoded.unwrap(),
        value: String::from("0"),
    };

    println!("Transaction to be created: {:#?}", transaction);
    let create_transaction = client.invoke::<SafeTransaction>(
        &SAFE_MANAGER_URI,
        "createTransaction",
        Some(
            &serialize(&CreateTransactionArgs {
                tx: transaction.clone(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if create_transaction.is_err() {
        panic!(
            "Error creating transaction: {:?}",
            create_transaction.unwrap_err()
        )
    }

    println!(
        "Transaction created: {:#?}",
        create_transaction.clone().unwrap()
    );

    let sign_transaction = client.invoke::<SafeTransaction>(
        &SAFE_MANAGER_URI,
        "addSignature",
        Some(
            &serialize(&AddSignatureArgs {
                tx: create_transaction.unwrap(),
                signing_method: "eth_signTypedData".to_string(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if sign_transaction.is_err() {
        panic!(
            "Error signing transaction: {:?}",
            sign_transaction.unwrap_err()
        )
    }

    println!(
        "Transaction signed: {:#?}",
        sign_transaction.clone().unwrap()
    );

    let execute_transaction = client.invoke::<TxReceipt>(
        &SAFE_MANAGER_URI,
        "executeTransaction",
        Some(
            &serialize(&ExecuteTransactionArgs {
                tx: sign_transaction.unwrap(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    if execute_transaction.is_err() {
        panic!(
            "Error executing transaction: {:?}",
            execute_transaction.unwrap_err()
        )
    }

    println!(
        "Transaction executed with hash: {:?}",
        execute_transaction.unwrap().transaction_hash
    );
    print!("Owner with address: {} has been added", OWNER_TO_BE_ADDED);
}
