extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use polywrap_client::msgpack::to_vec;
use safe_rust_playground::{
    helpers::get_client, AddSignatureArgs, CreateTransactionArgs, EncodeFunctionArgs,
    ExecuteTransactionArgs, SafeTransaction, Transaction, TxReceipt, ETHERS_UTILS_WRAPPER_URI,
    OWNER_TWO_PRIVATE_KEY, SAFE_MANAGER_URI,
};

fn main() {
    let client_with_owner_one = get_client(None);
    let client_with_owner_two = get_client(Some(OWNER_TWO_PRIVATE_KEY.clone()));

    let encoded_transaction = client_with_owner_one.invoke::<String>(
        &ETHERS_UTILS_WRAPPER_URI,
        "encodeFunction",
        Some(
            &to_vec(&EncodeFunctionArgs {
                method: String::from("function store(uint256 num) public"),
                args: Vec::from(["8".to_string()]),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    println!(
        "Call to function encoded: {:#?}",
        encoded_transaction.clone().unwrap()
    );

    let transaction_to_execute = Transaction {
        data: encoded_transaction.unwrap(),
        to: "0x56535D1162011E54aa2F6B003d02Db171c17e41e".to_string(),
        value: "0x".to_string(),
    };

    let create_transaction = client_with_owner_one.invoke::<SafeTransaction>(
        &SAFE_MANAGER_URI,
        "createTransaction",
        Some(
            &to_vec(&CreateTransactionArgs {
                tx: transaction_to_execute.clone(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    let owner_one_signed_tx = client_with_owner_one.invoke::<SafeTransaction>(
        &SAFE_MANAGER_URI,
        "addSignature",
        Some(
            &to_vec(&AddSignatureArgs {
                tx: create_transaction.unwrap(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    let sign_transaction = client_with_owner_two.invoke::<SafeTransaction>(
        &SAFE_MANAGER_URI,
        "addSignature",
        Some(
            &to_vec(&AddSignatureArgs {
                tx: owner_one_signed_tx.unwrap(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    let execute_transaction = client_with_owner_two.invoke::<TxReceipt>(
        &SAFE_MANAGER_URI,
        "executeTransaction",
        Some(
            &to_vec(&ExecuteTransactionArgs {
                tx: sign_transaction.unwrap(),
            })
            .unwrap(),
        ),
        None,
        None,
    );

    println!(
        r#"Transaction executed!
https://goerli.etherscan.io/tx/{}"#,
        execute_transaction.unwrap().transaction_hash
    )
}
