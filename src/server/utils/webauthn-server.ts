import base64url from 'base64url';
import * as cbor from 'cbor';
import * as crypto from 'crypto';
import produce from 'immer';
import {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRpEntity,
} from 'web-authentication-api';
import { User } from '../entities/user';

const U2F_USER_PRESENTED = 0x01;

export const createRandomBuffer = (length: number = 32): BufferSource => {
  return crypto.randomBytes(length);
};

export const createAssertionRequest = (authenticators: any[]) => {
  const allowCredentials = [];
  for (const authr of authenticators) {
    allowCredentials.push({
      id: authr.credID,
      transports: ['usb', 'nfc', 'ble'],
      type: 'public-key',
    });
  }
  return {
    allowCredentials,
    challenge: createRandomBuffer(),
  };
};

export const createAssertionRequestJSON = (authenticators: any[]) => {
  const assertionRequest = createAssertionRequest(authenticators);
  return produce(assertionRequest, (draft) => {
    draft.challenge = base64url.encode(draft.challenge as Buffer) as any;
  });
};

export const createCredentialRequest = (
  user: User,
  rp: PublicKeyCredentialRpEntity,
): PublicKeyCredentialCreationOptions => {
  return {
    attestation: 'direct',
    challenge: createRandomBuffer(),
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
    ],
    rp,
    user: {
      displayName: user.displayName,
      id: user.id,
      name: user.username,
    },
  };
};

export const createCredentialRequestFormatted = (
  user: User,
  rp: PublicKeyCredentialRpEntity,
): any => {
  const publicKeyCredentialOptions = createCredentialRequest(user, rp);
  return produce(publicKeyCredentialOptions, (draft) => {
    draft.challenge = base64url.encode(draft.challenge as Buffer) as any;
    draft.user.id = base64url.encode(draft.user.id as Buffer) as any;
  });
};

const verifySignature = (
  signature: Buffer,
  data: Buffer,
  publicKey: string,
) => {
  return crypto.createVerify('SHA256')
    .update(data)
    .verify(publicKey, signature);
};

export const hash = (data: Buffer): Buffer => {
  return crypto.createHash('SHA256').update(data).digest();
};

/**
 * CBOR Object Signing and Encryption
 * @param {Buffer} COSEPublicKey
 * @return {Buffer}
 *
 * @description
 * 先頭を0x04からはじめCOSEから取得したx、y値からBufferを作るとPublicKeyになる
 */
export const COSEECDHAtoPKCS = (COSEPublicKey: Buffer): Buffer => {
  /*
   +------+-------+-------+---------+----------------------------------+
   | name | key   | label | type    | description                      |
   |      | type  |       |         |                                  |
   +------+-------+-------+---------+----------------------------------+
   | crv  | 2     | -1    | int /   | EC Curve identifier - Taken from |
   |      |       |       | tstr    | the COSE Curves registry         |
   |      |       |       |         |                                  |
   | x    | 2     | -2    | bstr    | X Coordinate                     |
   |      |       |       |         |                                  |
   | y    | 2     | -3    | bstr /  | Y Coordinate                     |
   |      |       |       | bool    |                                  |
   |      |       |       |         |                                  |
   | d    | 2     | -4    | bstr    | Private key                      |
   +------+-------+-------+---------+----------------------------------+
  */
  const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  const tag = Buffer.from([0x04]);
  const x = coseStruct.get(-2);
  const y = coseStruct.get(-3);
  return Buffer.concat([tag, x, y]);
};

export const ASN1toPEM = (pkBuffer: Buffer): string => {
  if (!Buffer.isBuffer(pkBuffer)) {
    throw new Error('ASN1toPEM: pkBuffer must be Buffer');
  }
  let type: string;
  if (pkBuffer.length === 65 && pkBuffer[0] === 0x04) {
    /*
        If needed, we encode rawpublic key to ASN structure, adding metadata:
        SEQUENCE {
          SEQUENCE {
             OBJECTIDENTIFIER 1.2.840.10045.2.1 (ecPublicKey)
             OBJECTIDENTIFIER 1.2.840.10045.3.1.7 (P-256)
          }
          BITSTRING <raw public key>
        }
        Luckily, to do that, we just need to prefix
        it with constant 26 bytes (metadata is constant).
    */
    pkBuffer = Buffer.concat([
      Buffer.from(
        '3059301306072a8648ce3d020106082a8648ce3d030107034200',
        'hex',
      ),
      pkBuffer,
    ]);
    type = 'PUBLIC KEY';
  } else {
    type = 'CERTIFICATE';
  }

  const base64cert = pkBuffer.toString('base64');
  let PEMKey = '';
  for (let i = 0; i < Math.ceil(base64cert.length / 64); i++) {
    const start = 64 * i;
    PEMKey += base64cert.substr(start, 64) + '\n';
  }
  PEMKey = `-----BEGIN ${type}-----\n${PEMKey}-----END ${type}-----\n`;
  return PEMKey;
};

export const parseCredentialAuthData = (buffer: Buffer) => {
  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  const flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  const flags = flagsBuf[0];
  const counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  const counter = counterBuf.readUInt32BE(0);
  const aaguid = buffer.slice(0, 16);
  buffer = buffer.slice(16);
  const credIDLenBuf = buffer.slice(0, 2);
  buffer = buffer.slice(2);
  const credIDLen = credIDLenBuf.readUInt16BE(0);
  const credID = buffer.slice(0, credIDLen);
  buffer = buffer.slice(credIDLen);
  const COSEPublicKey = buffer;
  return {
    COSEPublicKey,
    aaguid,
    counter,
    counterBuf,
    credID,
    credIDLenBuf,
    flags,
    flagsBuf,
    rpIdHash,
  };
};

export const verifyAuthenticatorAttestationResponse = (
  webAuthnResponse: any,
) => {
  const attstationBuffer = base64url.toBuffer(
    webAuthnResponse.response.attestationObject,
  );
  const ctapCredentialResponse = cbor.decodeAllSync(attstationBuffer)[0];
  const response: any = { verified: false };
  if (ctapCredentialResponse.fmt === 'packed') {
    const authrDataStruct = parseCredentialAuthData(
      ctapCredentialResponse.authData,
    );
    if (!(authrDataStruct.flags & U2F_USER_PRESENTED)) {
      throw new Error('User was NOT presented durring authentication');
    }

    console.log(authrDataStruct);

    const clientDataHash = hash(base64url.toBuffer(
      webAuthnResponse.response.clientDataJSON,
    ));
    const publicKey = COSEECDHAtoPKCS(authrDataStruct.COSEPublicKey);
    const signatureBase = Buffer.concat([
      authrDataStruct.rpIdHash,
      authrDataStruct.flagsBuf,
      authrDataStruct.counterBuf,
      authrDataStruct.aaguid,
      authrDataStruct.credIDLenBuf,
      authrDataStruct.credID,
      authrDataStruct.COSEPublicKey,
      clientDataHash,
    ]);
    // X.509 Certificate Chain
    const PEMCertificate = ASN1toPEM(ctapCredentialResponse.attStmt.x5c[0]);
    const signature = ctapCredentialResponse.attStmt.sig;
    response.verified = verifySignature(
      signature,
      signatureBase,
      PEMCertificate,
    );
    if (response.verified) {
      response.authrInfo = {
        counter: authrDataStruct.counter,
        credID: base64url.encode(authrDataStruct.credID),
        fmt: 'fido-u2f',
        publicKey: base64url.encode(publicKey),
      };
    }
  }
  return response;
};

const findAuthr = (credID: string, authenticators: any[]) => {
  for (const authr of authenticators) {
    if (authr.credID === credID) {
      return authr;
    }
  }

  throw new Error('Unknown authenticator with credID');
};

const parseAssertionAuthData = (buffer: Buffer) => {
  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  const flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  const flags = flagsBuf[0];
  const counterBuf = buffer.slice(0, 4);
  // buffer = buffer.slice(4);
  const counter = counterBuf.readUInt32BE(0);
  return {
    counter,
    counterBuf,
    flags,
    flagsBuf,
    rpIdHash,
  };
};

export const verifyAuthenticatorAssertionResponse = (
  webAuthnResponse: any,
  authenticators: any[],
) => {
  const authr = findAuthr(webAuthnResponse.id, authenticators);
  const authenticatorData = base64url.toBuffer(
    webAuthnResponse.response.authenticatorData,
  );

  const response: any = { verifined: false };
  if (authr.fmt === 'packed') {
    const authrDataStruct = parseAssertionAuthData(authenticatorData);
    if (!(authrDataStruct.flags & U2F_USER_PRESENTED)) {
      throw new Error('User was NOT presented durring authentication');
    }
    const clientDataHash = hash(
      base64url.toBuffer(webAuthnResponse.response.clientDataJSON),
    );
    const signatureBase = Buffer.concat([
      authrDataStruct.rpIdHash,
      authrDataStruct.flagsBuf,
      authrDataStruct.counterBuf,
      clientDataHash,
    ]);
    const publicKey = ASN1toPEM(base64url.toBuffer(authr.publickKey));
    const signature = base64url.toBuffer(webAuthnResponse.response.signature);
    response.verifined = verifySignature(signature, signatureBase, publicKey);
    if (response.verifined) {
      if (response.counter <= authr.counter) {
        throw new Error('Authr counter did not increase');
      }
      authr.counter = authrDataStruct.counter;
    }
  }
  return response;
};
