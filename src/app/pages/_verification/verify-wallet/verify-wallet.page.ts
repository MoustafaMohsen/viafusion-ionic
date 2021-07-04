import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { contries } from 'src/app/services/static/datasets';
import { WalletService } from 'src/app/services/wallet/wallet.service';

@Component({
  selector: 'app-verify-wallet',
  templateUrl: './verify-wallet.page.html',
  styleUrls: ['./verify-wallet.page.scss'],
})
export class VerifyWalletPage implements OnInit {
  progress_percent = 80;
  radius = 100;
  subtitle = "Wallet"
  constructor(private walletSrv: WalletService, private loading: LoadingService, private router: Router) {
    this.watch_change();
  }

  wallet_form = new FormGroup({
    first_name: new FormControl("",[Validators.required]),
    last_name: new FormControl("",[Validators.required]),
    email: new FormControl("",[Validators.required,Validators.email]),
    country: new FormControl("",[Validators.required])

  })
  ngOnInit() {
  }

  submit() {
    // create wallet
    console.log(this.wallet_form.value);
    if (this.wallet_form.valid) {
      // this.walletSrv.create_wallet(this.wallet_form.value)
    }
  }

  // == country code
  //#region AutoComplete
  // countryCtrl = new FormControl();
  filteredCountries: Observable<ICountry[]>;

  countries: ICountry[] = contries

  watch_change() {
    this.filteredCountries = this.wallet_form.get("country").valueChanges
      .pipe(
        startWith(''),
        map((country: any) => country ? this._filterCountries(country) : this.countries.slice())
      );
  }
  private _filterCountries(value: string): ICountry[] {
    console.log("_filterCountries");

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
