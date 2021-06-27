import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VccDetailsPage } from './vcc-details.page';

const routes: Routes = [
  {
    path: '',
    component: VccDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VccDetailsPageRoutingModule {}
