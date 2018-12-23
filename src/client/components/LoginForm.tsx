import * as React from 'react';
import {
  loginCredentialRequest,
  loginCredentialResponse,
} from '../api/webauthn-api';
import {
  preformatAssertionRequest,
  publicKeyCredentialToJSON,
} from '../utils/webauthn-client';

interface State {
  username: string;
}

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

export class LoginForm extends React.Component<{}, State> {
  public state: State = {
    username: '',
  };
  public handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username } = this.state;
    try {
      await login(username);
      window.alert('Success to Login');
    } catch (e) {
      console.error(e);
      window.alert('Failed to Login');
    }
  }
  public render() {
    const {
      username,
    } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="username">
          username:
          <input type="text" name="username" value={username} onChange={(e) => {
            this.setState({
              username: e.target.value,
            });
          }} />
        </label>
        <input type="submit" value="sign in" />
      </form>
    );
  }
}
