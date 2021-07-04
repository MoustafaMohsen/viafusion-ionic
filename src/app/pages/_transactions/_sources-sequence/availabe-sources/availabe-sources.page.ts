import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { PaymentService } from './../../../../services/auth/payment';
import { Component, OnInit } from '@angular/core';
import { ISource } from 'src/app/interfaces/interfaces';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { contries } from 'src/app/services/static/datasets';
import { ListPayments } from 'src/app/interfaces/rapyd/ipayment';

@Component({
  selector: 'app-availabe-sources',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class AvailabeSourcesPage implements OnInit {

  //#endregion
  source_item: ListPayments.Response = {
    amount: 0,
  } as any;


  payment_list: ListPayments.Response[] = []

  constructor(private paymentSrv: PaymentService, private loading: LoadingService, private router: Router) {
    this.watch_change();
  }




  ngOnInit() {

  }

  select_source(payment_method: ListPayments.Response) {
    this.router.navigateByUrl("/transaction/sources-sequence/source?payment_method=" + encodeURIComponent(payment_method.type) + "&category=" + encodeURIComponent(payment_method.category) + "&image=" + encodeURIComponent(payment_method.image) + "&name=" + encodeURIComponent(payment_method.name))
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
  list_sources() {
    this.loading.start();
    let country = this.countries.find(x => x.alpha2Code === this.countryCtrl.value);
    if (country) {
      this.paymentSrv.list_payment_methods(country.alpha2Code).subscribe(res => {
        this.loading.stop();
        if (res.success) {
          console.log(res);
          this.payment_list = res.data.body.data

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
