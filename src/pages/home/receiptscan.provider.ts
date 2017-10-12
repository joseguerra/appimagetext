import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the City provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Receiptscan {

  constructor(public http: Http) {
  }

  send(datos){
    console.log(datos)
    var url = "https://read-images.herokuapp.com/api/v1/documents/"
    var response = this.http.post(url,datos).map(res => res.json());
    return response;

  }

}
