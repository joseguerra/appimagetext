import { AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { HomePage } from './home';

@Component({
    selector: 'receipt-scan',
    templateUrl: 'index.html'
})
export class Index {
  home: any;
  constructor(public alertCtrl: AlertController) {
    this.home = HomePage;
  }

  showRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Lightsaber color');

    alert.addInput({
      type: 'radio',
      label: 'Blue',
      value: 'blue',
      checked: true
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        // this.testRadioOpen = false;
        // this.testRadioResult = data;
      }
    });
    alert.present();
  }
}
