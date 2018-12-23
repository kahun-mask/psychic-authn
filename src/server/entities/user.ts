import { PublicKeyCredentialParameters } from 'web-authentication-api';

export class User {
  public id: BufferSource;
  public displayName: string;
  public username: string;
  public authenticators: PublicKeyCredentialParameters[];
  public registered: boolean;
}
