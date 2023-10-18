/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

import { AuthorizationStatusEnumType, IdTokenEnumType, MessageFormatEnumType } from "../enums";

export interface TransactionEventResponse {
  customData?: CustomDataType;
  /**
   * SHALL only be sent when charging has ended. Final total cost of this transaction, including taxes. In the currency configured with the Configuration Variable: &lt;&lt;configkey-currency,`Currency`&gt;&gt;. When omitted, the transaction was NOT free. To indicate a free transaction, the CSMS SHALL send 0.00.
   *
   *
   */
  totalCost?: number;
  /**
   * Priority from a business point of view. Default priority is 0, The range is from -9 to 9. Higher values indicate a higher priority. The chargingPriority in &lt;&lt;transactioneventresponse,TransactionEventResponse&gt;&gt; is temporarily, so it may not be set in the &lt;&lt;cmn_idtokeninfotype,IdTokenInfoType&gt;&gt; afterwards. Also the chargingPriority in &lt;&lt;transactioneventresponse,TransactionEventResponse&gt;&gt; overrules the one in &lt;&lt;cmn_idtokeninfotype,IdTokenInfoType&gt;&gt;.
   *
   */
  chargingPriority?: number;
  idTokenInfo?: IdTokenInfoType;
  updatedPersonalMessage?: MessageContentType;
}
/**
 * This class does not get 'AdditionalProperties = false' in the schema generation, so it can be extended with arbitrary JSON properties to allow adding custom data.
 */
export interface CustomDataType {
  vendorId: string;
  [k: string]: unknown;
}
/**
 * ID_ Token
 * urn:x-oca:ocpp:uid:2:233247
 * Contains status information about an identifier.
 * It is advised to not stop charging for a token that expires during charging, as ExpiryDate is only used for caching purposes. If ExpiryDate is not given, the status has no end date.
 *
 */
export interface IdTokenInfoType {
  customData?: CustomDataType;
  status: AuthorizationStatusEnumType;
  /**
   * ID_ Token. Expiry. Date_ Time
   * urn:x-oca:ocpp:uid:1:569373
   * Date and Time after which the token must be considered invalid.
   *
   */
  cacheExpiryDateTime?: string;
  /**
   * Priority from a business point of view. Default priority is 0, The range is from -9 to 9. Higher values indicate a higher priority. The chargingPriority in &lt;&lt;transactioneventresponse,TransactionEventResponse&gt;&gt; overrules this one.
   *
   */
  chargingPriority?: number;
  /**
   * ID_ Token. Language1. Language_ Code
   * urn:x-oca:ocpp:uid:1:569374
   * Preferred user interface language of identifier user. Contains a language code as defined in &lt;&lt;ref-RFC5646,[RFC5646]&gt;&gt;.
   *
   *
   */
  language1?: string;
  /**
   * Only used when the IdToken is only valid for one or more specific EVSEs, not for the entire Charging Station.
   *
   *
   *
   * @minItems 1
   */
  evseId?: [number, ...number[]];
  groupIdToken?: IdTokenType;
  /**
   * ID_ Token. Language2. Language_ Code
   * urn:x-oca:ocpp:uid:1:569375
   * Second preferred user interface language of identifier user. Don’t use when language1 is omitted, has to be different from language1. Contains a language code as defined in &lt;&lt;ref-RFC5646,[RFC5646]&gt;&gt;.
   *
   */
  language2?: string;
  personalMessage?: MessageContentType;
}
/**
 * Contains a case insensitive identifier to use for the authorization and the type of authorization to support multiple forms of identifiers.
 *
 */
export interface IdTokenType {
  customData?: CustomDataType;
  /**
   * @minItems 1
   */
  additionalInfo?: [AdditionalInfoType, ...AdditionalInfoType[]];
  /**
   * IdToken is case insensitive. Might hold the hidden id of an RFID tag, but can for example also contain a UUID.
   *
   */
  idToken: string;
  type: IdTokenEnumType;
}
/**
 * Contains a case insensitive identifier to use for the authorization and the type of authorization to support multiple forms of identifiers.
 *
 */
export interface AdditionalInfoType {
  customData?: CustomDataType;
  /**
   * This field specifies the additional IdToken.
   *
   */
  additionalIdToken: string;
  /**
   * This defines the type of the additionalIdToken. This is a custom type, so the implementation needs to be agreed upon by all involved parties.
   *
   */
  type: string;
}
/**
 * Message_ Content
 * urn:x-enexis:ecdm:uid:2:234490
 * Contains message details, for a message to be displayed on a Charging Station.
 *
 *
 */
export interface MessageContentType {
  customData?: CustomDataType;
  format: MessageFormatEnumType;
  /**
   * Message_ Content. Language. Language_ Code
   * urn:x-enexis:ecdm:uid:1:570849
   * Message language identifier. Contains a language code as defined in &lt;&lt;ref-RFC5646,[RFC5646]&gt;&gt;.
   *
   */
  language?: string;
  /**
   * Message_ Content. Content. Message
   * urn:x-enexis:ecdm:uid:1:570852
   * Message contents.
   *
   *
   */
  content: string;
}




