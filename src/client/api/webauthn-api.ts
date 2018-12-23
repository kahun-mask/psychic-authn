export const registrationCredentialRequest = (
  body: string,
) => {
  return fetch(
    '/webauthn/register/request',
    {
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  ).then((response) => response.json());
};

export const registrationCredentialResponse = (
  body: string,
) => {
  return fetch(
    '/webauthn/register/response',
    {
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  ).then((response) => response.json());
};

export const loginCredentialRequest = (
  body: string,
) => {
  return fetch(
    '/webauthn/login/request',
    {
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  ).then((response) => response.json());
};

export const loginCredentialResponse = (
  body: string,
) => {
  return fetch(
    '/webauthn/login/response',
    {
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  ).then((response) => response.json());
};
