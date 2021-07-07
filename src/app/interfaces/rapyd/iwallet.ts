import { IAccType } from './general';
import { IContact } from "./icontact";
import { WalletTransactionTypes } from './types';

export interface IWallet {
  first_name?: string
  last_name?: string
  phone_number?: string
  email?: string

  /**
  * Set by the user.
 */
  ewallet_reference_id: string
  metadata: any
  type?: IAccType
  contact?: IContact
  contacts?: {
    data: IContact[];
    has_more: boolean,
    total_count: number,
    /**
     *  Example "/v1/ewallets/ewallet_c633f0da4a5997a71918940c95a3aae0/contacts"
     */
    url: string;

  }
}

export interface WalletBalanceResponse {
  id: string
  currency: string
  alias: string
  balance: number
  received_balance: number
  on_hold_balance: number
  reserve_balance: number
  limits: any
  limit: any
}


export namespace TransferToWallet {
  export interface Request {
    source_ewallet: string
    amount: number
    currency: string
    destination_ewallet: string
    metadata: any
  }
  export interface Response {

    id: string
    /**
     ** accept - The transferee accepts the transfer.
    * cancel - The sender cancels the transaction.
    * decline - The transferee declines to accept the transfer.

    Response - One of the following:
    * CAN - The sender canceled the transaction.
    * DEC - The transferee declined to accept the transfer.
    * PEN - Pending. Waiting for the transferee to respond.
    * CLO - Closed. The transferee accepted the transfer.

    Other transactions:
    * CANCELED
    * CLOSED
     */
    status: "PEN" | "CLO" | "DEC" | "CAN"
    amount: number
    currency_code: string
    destination_phone_number: string
    destination_ewallet_id: string
    destination_transaction_id: string
    source_ewallet_id: string
    source_transaction_id: string
    transfer_response_at: number
    created_at: number

    /** metadata set by who made the request  (source's metadata)*/
    metadata: any
    /** metadata set by the response (destination's metadata)*/
    response_metadata: any

  }

  export interface Set_Response {
    /** The transfer id */
    id: string;
    /** The desired status */
    status: "accept" | "cancel" | "decline";
    metadata?: any
  }
}


export namespace ICurrency {
  export interface QueryRequest {
    sell_currency: string
    buy_currency: string
    action_type: "payment" | "payout"
  }
  export interface Response {
    sell_currency: string
    buy_currency: string
    action_type: "payment" | "payout"
    fixed_side: any
    rate: number
    date: string
    sell_amount: any
    buy_amount: any
  }

}


export interface IWalletTransaction {
  id: string
  amount: number
  currency: string
  ewallet_id: string
  type: WalletTransactionTypes
  balance_type: string
  balance?: number
  created_at: number
  status: string
  reason: string
}

export const wallet_transaction_description = {
  /**
* Funds transferred from a bank account to a wallet via an issued bank account number.
*/
  bank_issuing_in: "Bank transfer received",
  /**
  * Funds returned to wallet from canceled or rejected payout.
  */
  payout_funds_in: "Cancellation of disbursement",
  /**
  * Refund against funds paid out to a card issued by Rapyd.
  */
  card_issuing_in: "Card payout reversal",
  /**
  * Adjust the amount of a transaction made by an issued card.
  */
  card_issuing_adjustment: "Card issuing adjustment",
  /**
  * Funds deposited to wallet at point of sale.
  */
  deposit_funds: "Deposit at POS",
  /**
  * Funds paid out via a payout.
  */
  payout_funds_out: "Disbursement",
  /**
  * Funds paid out from wallet to a service provider.
  */
  provider_service_funds_out: "Disbursement to service provider",
  /**
  * Funds added to wallet.
  */
  add_funds: "Funds added",
  /**
  * Funds collected to wallet.
  */
  payment_funds_in: "Funds collected",
  /**
  * Funds paid out from wallet via issued card.
  */
  card_issuing_out: "Funds paid out via card",
  /**
  * Funds removed from wallet.
  */
  remove_funds: "Funds removed",
  /**
  * Transfers funds from the 'available_balance' to the 'on_hold_balance'.
  */
  put_funds_on_hold: "Put funds on hold",
  /**
  * Funds refunded against a payment.
  */
  payment_funds_out: "Refund against funds collected",
  /**
  * Wallet credited with funds released from escrow.
  */
  release_escrow: "Release from escrow",
  /**
  * Transfers wallet funds from the on-hold balance to the available balance.
  */
  release_on_hold_funds: "Release on-hold funds",
  /**
  * Funds transferred between two wallets.
  */
  p2p_transfer: "Wallet-to-wallet transfer",
  /**
  * Cash withdrawn from wallet at point of sale.
  */
  withdraw_funds: "Withdrawal at POS",
}
