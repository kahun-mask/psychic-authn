import base64url from 'base64url';
import {
  Request,
  Response,
  Router,
} from 'express';
import { User } from '../entities/user';
import { userStorage } from '../storage/userStorage';
import {
  createAssertionRequestJSON,
  createCredentialRequestFormatted,
  createRandomBuffer,
  verifyAuthenticatorAssertionResponse,
  verifyAuthenticatorAttestationResponse,
} from '../utils/webauthn-server';

export const webauthnRouter = Router();

webauthnRouter.post('/register/request', (req: Request, res: Response) => {
  const {
    name,
    username,
  } = req.body;

  if (!username || !name) {
    res.sendStatus(500);
    return;
  }

  const user = userStorage.get(username);
  if (user && user.registered) {
    res.send(400);
    return;
  }

  const newUser = new User();
  newUser.id = createRandomBuffer();
  newUser.displayName = name;
  newUser.username = username;
  newUser.registered = false;
  newUser.authenticators = [];

  userStorage.set(username, newUser);

  const credentialRequest = createCredentialRequestFormatted(newUser, {
    // id: '',
    name: 'Kahun Mask',
  });

  req.session.challenge = credentialRequest.challenge;
  req.session.username = username;

  res.json(credentialRequest);

});

webauthnRouter.post('/register/response', (req: Request, res: Response) => {
  const webAuthnResponse = req.body;
  const { id, rawId, response, type } = webAuthnResponse;
  const username = req.session.username;

  if (
    !username || !id || !rawId || !response || !type || type !== 'public-key'
  ) {
    res.sendStatus(400);
    return;
  }

  const clientData = JSON.parse(
    base64url.decode(response.clientDataJSON),
  );

  if (clientData.challenge !== req.session.challenge) {
    res.sendStatus(400);
    return;
  }

  if (clientData.origin !== 'http://localhost:3000') {
    res.sendStatus(400);
    return;
  }

  let result: any = {};
  if (clientData.type === 'webauthn.create') {
    result = verifyAuthenticatorAttestationResponse(webAuthnResponse);

    if (result.verified) {
      const user = userStorage.get(username);
      user.authenticators.push(result.authrInfo);
      user.registered = true;
      userStorage.set(username, user);
    }
  } else {
    res.sendStatus(400);
    return;
  }

  if (result.verified) {
    req.session.loggedIn = true;
    res.send(true);
  } else {
    res.sendStatus(400);
  }
});

webauthnRouter.post('/login/request', (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    res.sendStatus(400);
    return;
  }

  const user = userStorage.get(username);
  if (!user.registered) {
    res.sendStatus(400);
    return;
  }

  const assertionRequest = createAssertionRequestJSON(user.authenticators);
  req.session.username = username;
  req.session.challenge = assertionRequest.challenge;

  res.json(assertionRequest);
});

webauthnRouter.post('/login/response', (req: Request, res: Response) => {
  const webAuthnResponse = req.body;
  const { id, rawId, response, type } = webAuthnResponse;
  const username = req.session.username;

  if (
    !username || !id || !rawId || !response || !type || type !== 'public-key'
  ) {
    res.sendStatus(400);
    return;
  }

  const clientData = JSON.parse(
    base64url.decode(response.clientDataJSON),
  );

  if (clientData.challenge !== req.session.challenge) {
    res.sendStatus(400);
    return;
  }

  if (clientData.origin !== 'http://localhost:3000') {
    res.sendStatus(400);
    return;
  }

  let result: any = {};
  if (clientData.type === 'webauthn.get') {
    const user = userStorage.get(req.session.username);
    result = verifyAuthenticatorAssertionResponse(
      webAuthnResponse,
      user.authenticators,
    );
  } else {
    res.sendStatus(400);
    return;
  }

  if (result.verified) {
    req.session.loggedIn = true;
    res.send(true);
  } else {
    res.sendStatus(400);
  }
});
