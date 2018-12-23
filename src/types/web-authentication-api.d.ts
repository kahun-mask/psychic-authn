declare module 'web-authentication-api' {
  enum TokenBindingStatus {
    present = 'present',
    supported = 'supported',
  }

  export interface TokenBinding {
    status: TokenBindingStatus;
    id: string;
  }
  export interface CollectedClientData {
    type: string;
    challenge: string;
    origin: string;
    tokenBinding: TokenBinding;
  }

  export interface AuthenticatorResponse {
    readonly clientDataJSON: ArrayBuffer;
  }

  export interface PublicKeyCredeintial {
    readonly id: string;
    readonly type: string;
    readonly rawId: ArrayBuffer;
    readonly response: AuthenticatorResponse;
    // getClientExtensionResults(): AuthenticationExtensionsClientOutputs;
  }

  /**
   * IANA CBOR Object Signing and Encryption (COSE) Algorithms Registry
   * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#algorithms}
   */
  export type COSEAlgorithmIdentifier = number;

  /**
   * Credential Type Enumeration
   */
  export type PublicKeyCredentialType = 'public-key';

  /**
   * Authenticator Transport Enumeration
   */
  export type AuthenticatorTransport =
    'usb' | // Removable USB
    'nfc' | // Near Field Communication
    'ble' | // Bluetooth Smart (Bluetooth Low Energy)
    'internal'; // A client device-specific transport.

  /**
   * Authenticator Attachment Enumeration
   */
  export type AuthenticatorAttachment =
    'platform' |
    'cross-platform';

  /**
   * User Verification Requirement Enumeration
   */
  export type UserVerificationRequirement =
    'required' |
    'preferred' |
    'discouraged';

  /**
   * Authenticator Selection Criteria
   */
  export interface AuthenticatorSelectionCriteria {
    authenticatorAttachment: AuthenticatorAttachment;
    requireResidentKey: boolean; // default: false
    userVerification: UserVerificationRequirement; // default: 'preferred'
  }

  /**
   * Attestation Conveyance Preference Enumeration
   */
  export type AttestationConveyancePreference =
    'none' |
    'indirect' |
    'direct';

  export type AuthenticationExtensionsClientInputs = any;

  /**
   * Relying Party Parameters for Credential Generation
   */
  export interface PublicKeyCredentialRpEntity {
    id?: string; // DOMString
    name?: string;
  }

  /**
   * User Account Parameters for Credential Generation
   */
  export interface PublicKeyCredentialUserEntity {
    id: BufferSource;
    name?: string;
    displayName?: string;
  }

  /**
   * Parameters for Credential Generation
   */
  export interface PublicKeyCredentialParameters {
    type: PublicKeyCredentialType;
    alg: COSEAlgorithmIdentifier;
  }

  /**
   * Credential Descriptor
   */
  export interface PublicKeyDescriptor {
    type: PublicKeyCredentialType;
    id: BufferSource;
    transports: AuthenticatorTransport[];
  }

  /**
   * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialcreationoptions}
   */
  export interface PublicKeyCredentialCreationOptions {
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;
    challenge: BufferSource;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout?: number; // unsigned long: 0 ～ 18446744073709551615
    excludeCredentials?: PublicKeyDescriptor[];
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    extensions?: AuthenticationExtensionsClientInputs;
  }

  /**
   * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialentity}
   */
  export interface PublicKeyCredentialEntity {
    name: string;
    icon: string;
  }
}
