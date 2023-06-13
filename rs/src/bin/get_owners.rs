extern crate polywrap_client;
extern crate safe_rust_playground;
extern crate serde;

use safe_rust_playground::{helpers::get_client, SAFE_MANAGER_URI};

fn main() {
    let client = get_client(None);
    let owners =
        client.invoke::<Vec<String>>(&SAFE_MANAGER_URI.clone(), "getOwners", None, None, None);

    if owners.is_err() {
        panic!("Error fetching owners")
    }

    println!("Address of owners: {:#?}", owners.unwrap());
}
