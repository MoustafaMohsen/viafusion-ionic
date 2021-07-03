import { Component, OnInit } from '@angular/core';
declare var RapydCheckoutToolkit;
@Component({
  selector: 'app-checkout-test',
  templateUrl: './checkout-test.page.html',
  styleUrls: ['./checkout-test.page.scss'],
})
export class CheckoutTestPage implements OnInit {

  constructor() { }

  ngOnInit() {
    const script = document.createElement('script');
    script.src = 'https://sandboxcheckouttoolkit.rapyd.net';
    document.body.appendChild(script);
    script.onload = () => {
      console.log('script loaded');
      this.init_checkout();
    };

    window.addEventListener('onCheckoutPaymentSuccess', (event:any) => {
      console.log("onCheckoutPaymentSuccess");
      console.log(event.detail)
      // Returns 'Payment' object.
      // Client code.
    })

    window.addEventListener('onCheckoutFailure', (event:any) => {
      console.log("onCheckoutFailure");
      console.error(event.detail)
      // Returns an error message from the API.
      // Client code.
    })

    window.addEventListener('OnLoading', (event:any) => {
      console.log("OnLoading");
      console.error(event.detail)
      // returns true or false depending on the loading state
      // client code
    })


  }

  init_checkout() {
    // Instantiating ‘checkout’ with parametersInstantiating 'checkout' & setting variables
    let checkout = new RapydCheckoutToolkit({
      pay_button_text: "Click to pay",
      // Text that appears on the 'Pay' button.
      // String. Maximum length is 16 characters.
      // Default is "Place Your Order". Optional.
      pay_button_color: "blue",
      // Color of the 'Pay' button. String.
      // Standard CSS color name or hexadecimal code such as #323fff.
      // Default is the color that is returned in the 'merchant_color'
      // field of the response to 'Create Checkout Page'. Optional.
      id: "checkout_f0114f3cd7cbe99afe0d40728d893df0",
      // ID of the 'Create Checkout Page' response. String. Required.
      close_on_complete: true,
      // Causes the embedded Rapyd Checkout Toolkit window to close
      // when the payment is complete. Boolean. Default is 'true'. Optional.
      page_type: "collection"
      // Default is "collection". Optional.
    });

    console.log(checkout);

    console.log("checkout.displayCheckout();");
    checkout.displayCheckout();

  }

}
