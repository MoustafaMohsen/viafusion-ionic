import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PccDetailsPageRoutingModule } from './pcc-details-routing.module';

import { PccDetailsPage } from './pcc-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PccDetailsPageRoutingModule
  ],
  declarations: [PccDetailsPage]
})
export class PccDetailsPageModule {}
