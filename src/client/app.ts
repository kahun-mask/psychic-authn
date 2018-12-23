import {
  loginCredentialRequest,
  loginCredentialResponse,
  registrationCredentialRequest,
  registrationCredentialResponse,
} from './api/webauthn-api';
import {
  preformatAssertionRequest,
  preformatCredentialRequest,
  publicKeyCredentialToJSON,
} from './utils/webauthn-client';

const register = async (name: string, username: string) => {
  const credentialRequest = await registrationCredentialRequest(
    JSON.stringify({
      name,
      username,
    }),
  );

  const publicKey = preformatCredentialRequest(credentialRequest);
  const publicKeyCredential = await (navigator as any).credentials.create({
    publicKey,
  });
  const publicKeyCredentialJSON = publicKeyCredentialToJSON(
    publicKeyCredential,
  );

  return await registrationCredentialResponse(
    JSON.stringify(publicKeyCredentialJSON),
  );

};

export const login = async (username: string) => {
  const credentialRequest = await loginCredentialRequest(
    JSON.stringify({ username }),
  );

  const publicKey = preformatAssertionRequest(credentialRequest);
  const publicKeyCredential = await (navigator as any).credentials.get({
    publicKey,
  });
  const publicKeyCredentialJSON = publicKeyCredentialToJSON(
    publicKeyCredential,
  );

  return await loginCredentialResponse(
    JSON.stringify(publicKeyCredentialJSON),
  );
};

const bootstrap = async () => {
  console.log('bootstrap');

  const sampleBody = {
    name: 'kahun_mask',
    username: 'kahun_mask',
  };

  try {
    await register(sampleBody.name, sampleBody.username);
  } catch (e) {
    alert('failed!');
  }
};

bootstrap();
