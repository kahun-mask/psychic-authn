import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from './components/AppContainer';

const bootstrap = async () => {
  console.log('bootstrap');

  ReactDOM.render(
    <AppContainer />,
    document.getElementById('app'),
  );
};

bootstrap();
