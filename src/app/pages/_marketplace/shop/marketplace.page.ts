import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoriesModalComponent } from 'src/app/components/categories-modal/categories-modal.component';


@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
})
export class MarketplacePage implements OnInit {
ngOnInit() {
  }
  constructor(public modalCtrl: ModalController) {}

  async initModal() {
    const modal = await this.modalCtrl.create({
      component: CategoriesModalComponent,
      cssClass:"bottom-drawer",
      componentProps: {
        'name': 'modal name'
      }
    });
      return await modal.present();
  }
  onClick(){

  }
}
