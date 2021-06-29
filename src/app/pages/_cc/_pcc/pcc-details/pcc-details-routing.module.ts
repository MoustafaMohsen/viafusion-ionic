import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PccDetailsPage } from './pcc-details.page';

const routes: Routes = [
  {
    path: '',
    component: PccDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PccDetailsPageRoutingModule {}
