import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ICountry } from 'src/app/interfaces/interfaces';
import { ICreateChckoutPage } from 'src/app/interfaces/rapyd/iwallet';
import { PayoutService } from 'src/app/services/auth/payout';
import { LoadingService } from 'src/app/services/loading.service';
import { RX } from 'src/app/services/rx/events.service';
import { contries, curruncies } from 'src/app/services/static/datasets';
import { WalletService } from 'src/app/services/wallet/wallet.service';

@Component({
  selector: 'app-generate-checkout',
  templateUrl: './generate-checkout.page.html',
  styleUrls: ['./generate-checkout.page.scss'],
})
export class GenerateCheckoutPage {

  @Input() currencies: string[] = curruncies;
  @Input() remaing_ballance;
  @Input() title = "Enter Amount and Select Currency";
  amount = 0;

  ionViewWillEnter() {
    this.remaing_ballance = this.walletSrv.balance$.value
    this.watch_change();
  }

  form = new FormGroup({
    amount: new FormControl("", [Validators.required, Validators.min(1)]),
    currency: new FormControl("USD", [Validators.required])
  })
  constructor(
    private modalCtr: ModalController, private router: Router, private rx: RX, private payoutSrv: PayoutService, private loading: LoadingService, private walletSrv: WalletService,
  ) { }

  async close() {
    this.modalCtr.dismiss()
  }
  checkout_url = ""
  async continue() {
    this.loading.start()
    const closeModal: string = "Modal Closed";
    var checkout_request: ICreateChckoutPage.Request = {
      amount: this.form.value.amount,
      country: this.countryCtrl.value,
      currency: this.form.value.currency,
      complete_payment_url: "https://viafusion.net/complete",
      error_payment_url: "https://viafusion.net/error",
      merchant_reference_id: "950ae8c6-78",
      cardholder_preferred_currency: true,
      language: "en",
      metadata: {
        merchant_defined: true
      },
      payment_method_types_include: [],
      expiration: 1611384431,
      payment_method_types_exclude: [],
      custom_elements: {
        "save_card_default": true,
        "display_description": true,
        "payment_fees_display": true,
        "merchant_currency_only": true,
        "billing_address_collect": true,
        "dynamic_currency_conversion": true
      }
    }


    this.walletSrv.generate_checkout_page(checkout_request).subscribe(res => {
      this.loading.stop()

      if (res.success) {
        this.checkout_url = res.data.redirect_url;
        this.rx.temp.checkouts.push(res.data);
        console.log(res.data);

        this.rx.toast("Payment Request created succesfully");
        this.router.navigateByUrl("/payment/qr-payment")
      } else {
        this.rx.toastError(res as any)
      }
    }, error => {
      this.loading.stop()
    })
  }

  open_latest(){
    this.router.navigateByUrl("/payment/qr-payment")
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

  private _filterCountries(value: string): ICountry[] {
    const filterValue = value.toLowerCase();
    console.log(value);

    return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
  }
  //#endregion
}
