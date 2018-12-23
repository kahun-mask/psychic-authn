import {
  Request,
  Response,
  Router,
} from 'express';
import { oneliner } from '../utils/template';

export const spaRouter = Router();

spaRouter.get('*', (req: Request, res: Response) => {
  // tslint:disable:max-line-length
  res.send(oneliner`
  <!doctype html>
  <html>
    <head>
      <title>psychic authn</title>
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
