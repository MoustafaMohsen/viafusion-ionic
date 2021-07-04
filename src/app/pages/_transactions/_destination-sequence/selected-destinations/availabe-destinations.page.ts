import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IDestination, TStatus as _TStatus, TDestinationPoint as _TDestinationPoint } from 'src/app/interfaces/interfaces';
import { PostCreatePayment } from 'src/app/interfaces/rapyd/ipayment';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-destinations-page',
  templateUrl: './availabe-destinations.page.html',
  styleUrls: ['./availabe-destinations.page.scss'],
})
export class SelectedDestinationsPage implements OnInit {

  destination_item: IDestination = {
    name: "wallet",
    description: "",
    start_date: new Date(),
  };
  selected_destinations: PostCreatePayment.Request[] = [];
  destination_amount = "0"

  constructor(private loading: LoadingService, private router: Router, private rx: RX) { }

  ngOnInit() {
    this.selected_destinations = this.rx.temp["transaction"]["destinations"].value;
    this.rx.temp.transaction.destinations.subscribe(d=>{
      this.selected_destinations = d;
      // calculate destination total
      this.destination_amount = this.rx.temp["transaction"].destination_amount = this.selected_destinations.map(s=>s.amount).reduce((a, b) => a + b, 0)
      +"" || 0+"";
    })
  }
  continue_to_destination() {
    this.router.navigateByUrl("transaction/destinations/list-destinations");
  }

  add_destination() {
    this.router.navigateByUrl("transaction/destinations-sequence/available-destinations");
  }

  edit_destination(destination:PostCreatePayment.Request){
    this.router.navigateByUrl("/transaction/destinations-sequence/destination?payment_method="+encodeURIComponent(destination.payment_method.type)+"&category="+encodeURIComponent(destination.metadata.category)+"&image="+encodeURIComponent(destination.metadata.image)+"&name="+encodeURIComponent(destination.metadata.name))
  }

}
