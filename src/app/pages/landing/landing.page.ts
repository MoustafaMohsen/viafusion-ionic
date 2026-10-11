import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  styleUrls: ['landing.page.scss'],
})
export class LandingPage {

  features = [
    {
      icon: 'ewallet',
      title: 'One wallet, one overview',
      text: 'Explore balances and transaction history from a single dashboard.',
    },
    {
      icon: 'transfer',
      title: 'Flexible transfers',
      text: 'Discover flows that combine multiple payment sources and destinations.',
    },
    {
      icon: 'credit-card',
      title: 'Virtual cards',
      text: 'Explore virtual card creation and card controls.',
    },
  ];

  constructor() {}
}
