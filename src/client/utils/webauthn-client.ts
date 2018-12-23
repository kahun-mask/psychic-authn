import produce from 'immer';
import {
  decode,
  encode,
} from './base64-arraybuffer';

/**
 * generate random Uint8Array
 * @param length
 */
import { PublicKeyCredentialCreationOptions } from 'web-authentication-api';

export const generateRandomBuffer = (length: number = 32) => {
  const randomBuffer = new Uint8Array(length);
  window.crypto.getRandomValues(randomBuffer);
  return randomBuffer;
};

export const preformatCredentialRequest = (
  pubKeyCredOptions: PublicKeyCredentialCreationOptions,
) => {

  return produce(pubKeyCredOptions, (draft) => {

    if (typeof draft.challenge === 'string') {
      draft.challenge = decode(draft.challenge);
    }

    if (typeof draft.user.id === 'string') {
      draft.user.id = decode(draft.user.id);
    }

  });

};

export const publicKeyCredentialToJSON = (publicKeyCredential: any): any => {
  if (publicKeyCredential instanceof Array) {
    const arr = [];
    for (const i of publicKeyCredential) {
      arr.push(publicKeyCredentialToJSON(i));
    }
    return arr;
  }

  if (publicKeyCredential instanceof ArrayBuffer) {
    return encode(publicKeyCredential);
  }

  if (publicKeyCredential instanceof Object) {
    const obj: any = {};
    for (const key in publicKeyCredential) {
      if (publicKeyCredential[key]) {
        obj[key] = publicKeyCredentialToJSON(publicKeyCredential[key]);
      }
    }
    return obj;
  }

  return publicKeyCredential;
};

export const preformatAssertionRequest = (credOptions: any) => {
  return produce(credOptions, (draft) => {

    if (typeof draft.challenge === 'string') {
      draft.challenge = decode(draft.challenge);
    }

    for (const allowCred of credOptions.allowCredentials) {
      allowCred.id = decode(allowCred.id);
    }
  });
};
