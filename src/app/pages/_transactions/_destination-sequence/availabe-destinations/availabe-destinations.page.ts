import { PayoutService } from 'src/app/services/auth/payout';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Component, OnInit } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { contries } from 'src/app/services/static/datasets';
import { ListPayments } from 'src/app/interfaces/rapyd/ipayment';
import { IListPayout } from 'src/app/interfaces/rapyd/ipayout';

@Component({
  selector: 'app-availabe-destinations',
  templateUrl: './availabe-destinations.page.html',
  styleUrls: ['./availabe-destinations.page.scss'],
})
export class AvailabeDestinationsPage implements OnInit {

  //#endregion
  destination_item: IListPayout.Response = {
    amount: 0,
  } as any;


  payment_list: IListPayout.Response[] = []

  constructor(private payouySrv: PayoutService, private loading: LoadingService, private router: Router) {
    this.watch_change();
  }




  ngOnInit() {

  }

  select_destination(payout_response: IListPayout.Response) {

    // prompt amount field
    // prompt currency select

    // this.router.navigateByUrl("/transaction/destinations-sequence/destination?payment_method=" + encodeURIComponent(payment_method.type) + "&category=" + encodeURIComponent(payment_method.category) + "&image=" + encodeURIComponent(payment_method.image) + "&name=" + encodeURIComponent(payment_method.name))
  }

  // == country code
  //#region AutoComplete
  countryCtrl = new FormControl();
  filteredCountries: Observable<ICountry[]>;

  countries: ICountry[] = contries

  watch_change(){
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
          console.log(payment_list.length,payment_list);

          this.payment_list =  payment_list.filter(p=>p.sender_currencies[0]=="*" || p.sender_currencies.indexOf("USD") != -1)
          console.log(this.payment_list);


        }
      })
    }
  }
  private _filterCountries(value: string): ICountry[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
  }

}


export interface ICountry {
  name: string;
  alpha2Code: string;
  demonym: string;
  flag: string;
  callingCodes: string[];
  latlng: number[];
  nativeName: string;
}
