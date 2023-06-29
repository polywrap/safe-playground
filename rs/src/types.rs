use polywrap_client::plugin::Map;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EncodeAddOwner {
    #[serde(rename = "ownerAddress")]
    pub owner_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EncodeFunctionArgs {
    pub method: String,
    pub args: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EstimateTransactionGasArgs {
    pub tx: Transaction,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetEstimateFeeArgs {
    #[serde(rename = "chainId")]
    pub chain_id: u32,
    #[serde(rename = "gasLimit")]
    pub gas_limit: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTransactionArgs {
    pub tx: Transaction,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddSignatureArgs {
    pub tx: SafeTransaction,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub to: String,
    pub data: String,
    pub value: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Log {
    #[serde(rename = "blockNumber")]
    pub block_number: String,
    #[serde(rename = "blockHash")]
    pub block_hash: String,
    #[serde(rename = "transactionIndex")]
    pub transaction_index: u32,
    pub removed: bool,
    pub address: String,
    pub data: String,
    pub topics: Vec<String>,
    #[serde(rename = "transactionHash")]
    pub transaction_hash: String,
    #[serde(rename = "logIndex")]
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
pub struct SafeTransactionData {
    pub to: String,
    pub data: String,
    pub value: String,
    pub operation: String,
    #[serde(rename = "safeTxGas")]
    pub safe_tx_gas: String,
    #[serde(rename = "baseGas")]
    pub base_gas: String,
    #[serde(rename = "gasPrice")]
    pub gas_price: String,
    #[serde(rename = "gasToken")]
    pub gas_token: String,
    #[serde(rename = "refundReceiver")]
    pub refund_receiver: String,
    pub nonce: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SignSignature {
    pub signer: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetaTransactionData {
    pub to: String,
    pub data: String,
    pub operation: Option<String>,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SafeTransaction {
    pub signatures: Map<String, SignSignature>,
    pub data: SafeTransactionData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteTransactionArgs {
    pub tx: SafeTransaction,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetSafeAddressArgs {
    pub config: DeploymentConfig,
}

#[derive(Serialize, Deserialize)]
pub struct AccountConfig {
    pub owners: Vec<String>,
    pub threshold: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DeploymentConfig {
    #[serde(rename = "saltNonce")]
    pub salt_nonce: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SponsorDeploymentConfig {
    #[serde(rename = "saltNonce")]
    pub salt_nonce: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DeploymentInput {
    #[serde(rename = "safeAccountConfig")]
    pub safe_account_config: AccountConfig,
    #[serde(rename = "safeDeploymentConfig")]
    pub safe_deployment_config: Option<DeploymentConfig>,
    pub connection: Option<SchemaConnection>,
}

#[derive(Serialize, Deserialize)]
pub struct DeploymentArgs {
    pub input: DeploymentInput,
}

#[derive(Serialize, Deserialize)]
pub struct GetBalanceArgs {
    pub address: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SchemaConnection {
    #[serde(rename = "networkNameOrChainId")]
    pub network_name_or_chain_id: Option<String>,
    pub node: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SafeManagerEnv {
    #[serde(rename = "safeAddress")]
    pub safe_address: String,
    pub connection: SchemaConnection,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct MetaTransactionOptions {
    #[serde(rename = "gasLimit")]
    pub gas_limit: String,
    #[serde(rename = "isSponsored")]
    pub is_sponsored: Option<bool>,
    #[serde(rename = "gasToken")]
    pub gas_token: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct RelayTransactionArgs {
    pub transaction: MetaTransactionData,
    pub options: MetaTransactionOptions,
    pub config: Option<SponsorDeploymentConfig>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ToEthArgs {
    pub wei: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct RelayerAdapterEnv {
    #[serde(rename = "relayerApiKey")]
    pub relayer_api_key: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AccountAbstractionEnv {
    pub connection: SchemaConnection,
}
