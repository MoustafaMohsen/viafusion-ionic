import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDBContact } from 'src/app/interfaces/db/idbcontact';
import { ILogin, ILOginTransportObj } from 'src/app/interfaces/db/ilogin';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class RX {
  constructor(private storage:Storage) { }
  public user$= new BehaviorSubject<IDBContact>({
    security:{
      login:{
        authenticated:false
      }
    }
  });

  async init_subscribe(){
    console.log("storage user>>");
    console.log(this.storage.get("user"));


    (await this.storage.get("user") )&& this.storage.get("user").then(storage_user=>{
      if (storage_user) {
        this.user$.next(storage_user)
      }
    });
    this.user$.subscribe(u => {
      console.log("this.storage.set");
      console.log(u);

      this.storage.set("user", u);
      console.log("=== user$.subscribe fired");
      console.log(u);


    })
  }
}
