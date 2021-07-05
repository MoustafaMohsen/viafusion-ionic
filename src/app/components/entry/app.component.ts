import { RX } from './../../services/rx/events.service';
import { StorageService } from './../../services/storage/storage.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private storage: StorageService, private rx: RX) {
  }
  ngOnInit(){
    this.rx.init_subscribe();
  }
  ngAfterViewInit(): void {
    // this.rx.load_temp();
  }
}
