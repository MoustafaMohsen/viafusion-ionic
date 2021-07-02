import { RX } from './../../services/rx/events.service';
import { StorageService } from './../../services/storage/storage.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storage: StorageService, private rx: RX) {
    storage.get("user") && storage.get("user").then(storage_user=>{
      if (storage_user) {
        this.rx.user$.subscribe(u => {
         this.rx.user$.next(storage_user)
        })
      }
    });
    this.rx.user$.subscribe(u => {
      this.storage.set("user", u);
    })
  }
}
