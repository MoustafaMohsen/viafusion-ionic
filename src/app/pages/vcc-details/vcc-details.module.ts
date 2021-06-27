import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VccDetailsPageRoutingModule } from './vcc-details-routing.module';

import { VccDetailsPage } from './vcc-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VccDetailsPageRoutingModule
  ],
  declarations: [VccDetailsPage]
})
export class VccDetailsPageModule {}
