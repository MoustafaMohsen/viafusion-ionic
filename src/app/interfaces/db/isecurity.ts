import { ILogin } from 'src/app/interfaces/db/ilogin';

export interface IDBSecurity {
    login: ILogin;
    [key: string]: any;
}
