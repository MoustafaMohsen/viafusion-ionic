import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-enter-phone',
  templateUrl: './enter-phone.page.html',
  styleUrls: ['./enter-phone.page.scss'],
})
export class EnterPhonePage implements OnInit {
  
  constructor(public modalCtrl: ModalController) {}

  async initModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: {
        'number': '0123565498',
        'amount' : '251',
        'message' : 'this is message this is message this is message this is message this is message '
      },
      cssClass:"bottom-drawer"
    });
      return await modal.present();
  }
  ngOnInit() {
  }
  
  search_contacts(){
    
  }
}
