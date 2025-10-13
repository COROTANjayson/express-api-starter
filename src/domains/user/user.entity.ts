export default class UserEntity {
  public id?: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public age?: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public currentTokenId?: string | null;

  constructor(props: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age?: number;
    createdAt?: Date;
    updatedAt?: Date;
    currentTokenId?: string;
  }) {
    Object.assign(this, props);
  }
}
