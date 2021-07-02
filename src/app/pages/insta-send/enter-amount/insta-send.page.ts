import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insta-send',
  templateUrl: './insta-send.page.html',
  styleUrls: ['./insta-send.page.scss'],
})
export class InstaSendPage implements OnInit {

  constructor( private router : Router) { 

  }

  ngOnInit() {
  }
to_phone(){
  this.router.navigateByUrl('/insta-send/enter-phone')
}

}
