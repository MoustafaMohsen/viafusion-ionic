import { LoginService } from 'src/app/services/auth/login.service';
import { IUtilitiesResponse } from 'src/app/interfaces/rapyd/rest-response';
import { IssueVccRequest, IssueVccRequestForm } from './../../../interfaces/rapyd/ivcc';
import { VccService } from './../../../services/vcc/vcc.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RX } from 'src/app/services/rx/events.service';
import { IAPIServerResponse } from 'src/app/interfaces/rapyd/types';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verify-card',
  templateUrl: './verify-card.page.html',
  styleUrls: ['./verify-card.page.scss'],
})
export class VerifyCardPage implements OnInit,AfterViewInit {
  progress_percent = 10;
  radius = 100;
  subtitle = "card";

  country = "US";
  vcc_form = new FormGroup({
    date_of_birth: new FormControl("", [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)]),
    line_1: new FormControl("", [Validators.required]),
    state: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
    zip: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),

  })
  constructor(private vcc: VccService, private rx: RX, private router: Router, public loading: LoadingService, private route: ActivatedRoute, public toastController: ToastController,private loginSrv:LoginService) { }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.rx.get_db_metacontact().then(m => {
        this.loading.stop()
        if (m.vcc && m.vcc.length > 0) {
          this.router.navigateByUrl("dashboard");
        }
      })
    }, 1000);

    this.vcc_form.valueChanges.subscribe(v => {
      var values = Object.values(this.vcc_form.value).filter(v => v).length
      this.progress_percent = (values / 6) * 100
    })

  }

  ngOnInit() {
    this.country = this.route.snapshot.queryParamMap.get("country");
    this.route.queryParamMap.subscribe(rs => {
      this.country = rs.get("country");
    });
    this.loading.stop();

    // this.vcc_form.get("date_of_birth").valueChanges.subscribe((v:string)=>{
    //   v = this.vcc_form.get("date_of_birth").value;
    //   console.log(v);
    //   console.log(v.length);
    //   if ((v.length == 2 || v.length == ) && v[v.length-1] != "/") {
    //     this.vcc_form.get("date_of_birth").setValue(v+"/",{emitEvent:false})
    //   }
    // })

  }
  submit() {
    let user = this.rx.user$.value;
    let country = user.rapyd_contact_data ? user.rapyd_contact_data.country || this.country : "US";
    let date_of_birth = this.vcc_form.get("date_of_birth").value;
    let form: IssueVccRequestForm = {
      country,
      date_of_birth,
      address: {
        country,
        line_1: this.vcc_form.get("line_1").value,
        city: this.vcc_form.get("city").value,
        state: this.vcc_form.get("state").value,
        name: this.vcc_form.get("name").value,
        zip: this.vcc_form.get("zip").value
      } as any
    }
    console.log(form);
    this.loading.start()
    this.vcc.create_vcc(form).subscribe(res => {
      this.loading.stop();
      let user = res.data
      this.rx.user$.next(user);
      this.router.navigateByUrl("dashboard");
    }, (err: IAPIServerResponse<IUtilitiesResponse>) => {
      console.error(err)
      this.rx.toastError(err)
      this.loginSrv.critical_error_delete_account()
    })
  }

}
