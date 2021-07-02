import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Events {
  constructor() { }

  private _subjects$: {
    [key: string]: Subject<any>
  } = {};

  publish(key: string, value: any=null) {
    key = key.replace(":","_");
    if (this._subjects$[key]===undefined) {
      this._subjects$[key] = new Subject<any>();
    }
    console.log("-->publish");
    console.log(key);
    this._subjects$[key].next(value);
  }

  subscribe(key: string, callback: Function, err?: Function, completed?: Function) {
    key = key.replace(":","_");
    if (this._subjects$[key]===undefined) {
      this._subjects$[key] = new Subject<any>();
      console.log("<--subscribe");
      console.log(key);
    }
    this._subjects$[key].subscribe(
      (d) => {
        callback(d)
      },
      (e) => {
        err(e)
      },
      () => { completed }
    );
  }
}
