import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// @ts-ignore
import * as cookieSession from 'cookie-session';
import * as crypto from 'crypto';
import * as express from 'express';
import * as path from 'path';
import { spaRouter } from './router/spaRouter';
import { webauthnRouter } from './router/webauthnRouter';

const PORT = process.env.PORT || 3000;
export const app = express();

app.use(bodyParser.json());
app.use(cookieSession({
  keys: [crypto.randomBytes(32).toString('hex')],
  maxAge: 25 * 60 * 60 * 1000,
  name: 'session',
}));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, '../../static')));

app.use('/webauthn', webauthnRouter);
app.use('*', spaRouter);

app.listen(PORT, () => {
  console.log(`listen port ${PORT}`);
});
