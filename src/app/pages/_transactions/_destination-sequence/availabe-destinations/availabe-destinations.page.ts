import { RX } from 'src/app/services/rx/events.service';
import { PayoutService } from 'src/app/services/auth/payout';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Component, OnInit } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { contries, curruncies } from 'src/app/services/static/datasets';
import { ListPayments } from 'src/app/interfaces/rapyd/ipayment';
import { IGetPayoutRequiredFields, IListPayout } from 'src/app/interfaces/rapyd/ipayout';
import { ModalController } from '@ionic/angular';
import { ModalDestinationComponent } from 'src/app/components/modal-destination/modal.component';
import { ICountry } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-availabe-destinations',
  templateUrl: './availabe-destinations.page.html',
  styleUrls: ['./availabe-destinations.page.scss'],
})
export class AvailabeDestinationsPage implements OnInit {

  //#endregion
  payment_list: IListPayout.Response[] = []

  constructor(private payouySrv: PayoutService, private loading: LoadingService, private router: Router, public modalCtrl: ModalController, private rx: RX, private route: ActivatedRoute) {
    this.watch_change();
  }




  ngOnInit() {

  }

  async select_destination(payout_response: IListPayout.Response) {

    let request_query: IGetPayoutRequiredFields.QueryRequest = {
      beneficiary_country: this.countryCtrl.value,
      payout_amount: 0,
      payout_currency: "USD",
      payout_method_type: payout_response.payout_method_type,
      sender_country: this.rx.user$.value.rapyd_contact_data?.country || this.route.snapshot.queryParamMap.get("sender_country"),
      metadata:{
        name:payout_response.name,
        category:payout_response.category,
        image:payout_response.image,
        executed:false
      }
    }
    let payout_currencies = payout_response.payout_currencies[0] == "*"? curruncies : payout_response.payout_currencies
    // prompt amount field & currency select
    let modal = await this.modalCtrl.create({
      component: ModalDestinationComponent,
      componentProps: {
        currencies: payout_currencies,
        request_query
      },
      cssClass: "bottom-drawer"
    })

    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log(data);
  }

  // == country code
  //#region AutoComplete
  countryCtrl = new FormControl();
  filteredCountries: Observable<ICountry[]>;

  countries: ICountry[] = contries

  watch_change() {
    this.filteredCountries = this.countryCtrl.valueChanges
      .pipe(
        startWith(''),
        map((country: any) => country ? this._filterCountries(country) : this.countries.slice())
      );
  }
  list_destinations() {
    this.loading.start();
    let country = this.countries.find(x => x.alpha2Code === this.countryCtrl.value);
    if (country) {
      this.payouySrv.list_payout_methods(country.alpha2Code).subscribe(res => {
        this.loading.stop();
        if (res.success) {
          console.log(res);
          // filter destinations that are same curruncy
          let payment_list = res.data.body.data;
          console.log(payment_list.length, payment_list);

          this.payment_list = payment_list.filter(p => p.sender_currencies[0] == "*" || p.sender_currencies.indexOf("USD") != -1)
          console.log(this.payment_list);


        }
      })
    }
  }
  private _filterCountries(value: string): ICountry[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
  }
  //#endregion

}
