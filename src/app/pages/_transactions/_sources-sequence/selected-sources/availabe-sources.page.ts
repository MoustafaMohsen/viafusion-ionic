import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/interfaces/interfaces';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-sources-page',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class SelectedSourcesPage implements OnInit {

  source_item: ISource = {
    name: "wallet",
    description: "",
    start_date: new Date(),
    amount: 0,
  };

  selected_sources: PostCreatePayment.ICreate[] = [];


  constructor(private loading: LoadingService, private router: Router, private rx: RX) { }

  ngOnInit() {
    this.selected_sources = this.rx.temp["transaction"]["sources"].value;
    this.rx.temp.transaction.sources.subscribe(d=>{
      this.selected_sources = d
    })
  }
  continue_to_destination() {
    this.router.navigateByUrl("transaction/destinations/list-destinations");
  }

  add_source() {
    this.router.navigateByUrl("transaction/sources-sequence/available-sources");
  }

  edit_source(source:PostCreatePayment.ICreate){
    this.router.navigateByUrl("/transaction/sources-sequence/source?payment_method="+encodeURIComponent(source.payment_method.type)+"&category="+encodeURIComponent(source.metadata.category)+"&image="+encodeURIComponent(source.metadata.image)+"&name="+encodeURIComponent(source.metadata.name))
  }

}
