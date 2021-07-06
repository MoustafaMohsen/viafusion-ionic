import { RX } from 'src/app/services/rx/events.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  phone_number = "";
  name = "";
  constructor(private rx:RX) { }

  ngOnInit() {
    this.rx.user$.subscribe(u=>{
      this.phone_number = u.phone_number
      if (!u.rapyd_contact_data) {
        return
      }
      this.name = u.rapyd_contact_data.first_name + u.rapyd_contact_data.last_name
    })
  }

}
