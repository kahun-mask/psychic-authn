import * as React from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export class AppContainer extends React.Component {
  public render() {
    return (
      <div>
        <div className="Title">
          <div className="Title_Container">
            <h1 className="Title_h1">サイキック認証</h1>
            <p className="Title_p">パスワードなんていらない、そうサイキックならね</p>
          </div>
        </div>
        <div className="FormContent">
          <div className="FormSection">
            <h2>まずはサイキック登録</h2>
            <RegisterForm />
          </div>
          <div className="FormSection">
            <h2>サイキックログイン！</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }
}
