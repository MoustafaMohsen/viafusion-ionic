import { RX } from './../../services/rx/events.service';
import { StorageService } from './../../services/storage/storage.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private storage: StorageService, private rx: RX, private router: Router) {
  }

  /** the landing page is full width and carries its own demo note, every other route is the app itself */
  get is_landing() {
    return this.router.url.split(/[?#]/)[0] == "/";
  }

  get show_demo_label() {
    return environment.demo && !this.is_landing;
  }
  ngOnInit(){
    this.rx.init_subscribe();
  }
  ngAfterViewInit(): void {
    // this.rx.load_temp();
  }
}
