import * as React from 'react';
import {
  registrationCredentialRequest,
  registrationCredentialResponse,
} from '../api/webauthn-api';
import {
  preformatCredentialRequest,
  publicKeyCredentialToJSON,
} from '../utils/webauthn-client';

interface State {
  name: string;
  username: string;
}

export const register = async (name: string, username: string) => {
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

export class RegisterForm extends React.Component<{}, State> {
  public state: State = {
    name: '',
    username: '',
  };
  public handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      name,
      username,
    } = this.state;
    try {
      await register(name, username);
      window.alert('Success to register');
    } catch (e) {
      console.error(e);
      window.alert('Failed to register');
    }
  }
  public render() {
    const {
      name,
      username,
    } = this.state;
    return (
      <form onSubmit={this.handleSubmit} className="Form">
        <label htmlFor="name" className="Form_label">
          name:
          <input
            className="Form_input"
            type="text"
            name="name"
            value={name}
            required
            onChange={(e) => {
              this.setState({
                name: e.target.value,
              });
            }}
          />
        </label>
        <label htmlFor="username" className="Form_label">
          username:
          <input
            className="Form_input"
            type="text"
            name="username"
            value={username}
            required
            onChange={(e) => {
              this.setState({
                username: e.target.value,
              });
            }}
          />
        </label>
        <input type="submit" value="sign up" className="Form_submit" />
      </form>
    );
  }
}
