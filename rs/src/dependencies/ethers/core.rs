use polywrap_client::{
    core::file_reader::SimpleFileReader,
    wasm::{wasm_package::WasmPackage, wasm_wrapper::WasmWrapper},
};
use std::sync::Arc;

const WRAP_INFO: &[u8] = include_bytes!("../../../../wrap-dependencies/ethers/core/wrap.info");
const WRAP_WASM: &[u8] = include_bytes!("../../../../wrap-dependencies/ethers/core/wrap.wasm");

pub fn wasm_package() -> WasmPackage {
    WasmPackage::from_bytecode(
        WRAP_WASM.to_vec(),
        Arc::new(SimpleFileReader::new()),
        Some(WRAP_INFO.to_vec()),
    )
}

pub fn wasm_wrapper() -> WasmWrapper {
    WasmWrapper::try_from_bytecode(&WRAP_WASM.to_vec(), Arc::new(SimpleFileReader::new())).unwrap()
}
