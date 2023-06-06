import { PolywrapClient } from "@polywrap/client-js"
import { BigNumber } from "ethers"
import { CONNECTION, ETHERS_CORE_WRAPPER_URI } from "./constants"

const EXPECTED_ETH = "50000000000000000" // 0.005

export const checkSenderBalance = async (client: PolywrapClient) => {
    const address = await client.invoke({
        uri: ETHERS_CORE_WRAPPER_URI,
        method: "getSignerAddress",
        args: {
            connection: CONNECTION
        }
    })
    if (!address.ok) throw address.error

    const balance = await client.invoke({
        uri: ETHERS_CORE_WRAPPER_URI,
        method: "getBalance",
        args: {
            address: address.value
        }
    })
    if (!balance.ok) throw balance.error

    if (BigNumber.from(balance.value).lt(EXPECTED_ETH)) {
        console.warn("Signer address has low balance. Transaction is most likely to fail")
    }

}