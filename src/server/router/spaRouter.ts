import {
  Request,
  Response,
  Router,
} from 'express';
import { oneliner } from '../utils/template';

export const spaRouter = Router();

const style = oneliner`
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Helvetica Neue", "Segoe UI", sans-serif;
}

.Title {
  margin: 0;
  padding: 48px;
  text-align: center;
  background: #fa0;
}

.TitleContainer {
  max-width: 980px;
  margin: 0 auto;
}

.FormContent {
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}

.Form {
  margin-bottom: 16px;
}

.Form_label {
  display: block;
  width: 100%;
  margin-bottom: 8px;
}

.Form_input {
  margin-left: 16px;
  border: 1px solid #aaa;
}

.Form_submit {
  line-height: 48px;
  height: 48px;
  border: 1px solid #fa0;
  background-color: #fa0;
  font-weight: bold;
  width: 80px;
  border-radius: 4px;
}
`;

spaRouter.get('*', (req: Request, res: Response) => {
  // tslint:disable:max-line-length
  res.send(oneliner`
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>psychic authn</title>
      <style>${style}</style>
    </head>
    <body>
      <div id="app">
      </div>
      <script src="//cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.1/webcomponents-loader.js"></script>
      <script src="/static/app.js"></script>
    </body>
  </html>
  `);
  // tslint:enable:max-line-length
});
