import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILOginTransportObj } from 'src/app/interfaces/db/ilogin';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor() { }
  public auth$= new BehaviorSubject<ILOginTransportObj<IDBContact>>(null)
  public user$= new BehaviorSubject<IDBContact>(null)
}
