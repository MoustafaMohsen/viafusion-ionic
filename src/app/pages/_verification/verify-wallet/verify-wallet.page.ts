import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ICountry } from 'src/app/interfaces/interfaces';
import { LoginService } from 'src/app/services/auth/login.service';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { contries } from 'src/app/services/static/datasets';
import { WalletService } from 'src/app/services/wallet/wallet.service';

@Component({
  selector: 'app-verify-wallet',
  templateUrl: './verify-wallet.page.html',
  styleUrls: ['./verify-wallet.page.scss'],
})
export class VerifyWalletPage implements OnInit {
  progress_percent = 10;
  radius = 80;
  subtitle = ""
  constructor(private walletSrv: WalletService, public loading: LoadingService, private router: Router, private rx: RX, private loginSrv: LoginService) {
    this.watch_change();
  }

  wallet_form = new FormGroup({
    first_name: new FormControl("", [Validators.required]),
    last_name: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    country: new FormControl("", [Validators.required])

  })
  ngOnInit() {
    setTimeout(() => {
      if (this.rx.user$.value.ewallet && this.rx.user$.value.rapyd_wallet_data) {
        this.router.navigateByUrl("verification/verify-card?country=" + this.wallet_form.value.country)
      }
    }, 3000);
    this.wallet_form.valueChanges.subscribe(v => {
      var values = Object.values(this.wallet_form.value).filter(v => v).length
      this.progress_percent = (values / 4) * 100
    })
  }

  submit() {
    // create wallet
    console.log(this.wallet_form.value);
    this.loading.start();
    if (this.wallet_form.valid) {
      this.walletSrv.create_wallet(this.wallet_form.value).subscribe(res => {
        this.loading.stop();
        console.log(res);
        this.rx.user$.next(res.data);
        if (res.success) {
          this.router.navigateByUrl("verification/verify-card?country=" + this.wallet_form.value.country)
        } else {
          console.log(res);
          this.rx.toastError(res as any)
          this.loginSrv.critical_error_delete_account()
        }
      }, err => {
        console.log(err);
        this.rx.toastError(err)
        this.loginSrv.critical_error_delete_account()

      }
      )
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

