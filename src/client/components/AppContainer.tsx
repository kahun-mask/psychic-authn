import * as React from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export class AppContainer extends React.Component {
  public render() {
    return (
      <div>
        <div>
          <h1>サイキック認証</h1>
          <p>パスワードなんていらない、そうサイキックならね</p>
        </div>
        <div>
          <h2>まずはサイキック登録</h2>
          <RegisterForm />
        </div>
        <div>
          <h2>サイキックログイン！</h2>
          <LoginForm />
        </div>
      </div>
    );
  }
}
