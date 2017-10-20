import { Component } from '@angular/core';
import { NavController, NavParams,ActionSheetController,LoadingController,AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import Tesseract from 'tesseract.js';
import {Receiptscan} from './receiptscan.provider';
@Component({
    selector: 'receipt-scan',
    templateUrl: 'home.html'
})
export class HomePage {

    object: this
    private srcImage: string;
    public imgProcesada: any;
    public curp: any;
    public progreso: number =  0;
    private data: any;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public actionSheetCtrl: ActionSheetController,
                public receiptscanProvider :Receiptscan,
                public loadingCtrl: LoadingController,
                public camera: Camera,
                public alertCtrl: AlertController) {
                  this.data = {}
                 }

    presentActionSheet() {
        const actionSheet = this.actionSheetCtrl.create({
        buttons: [
            {
            text: 'Escoger imagen',
            handler: () => {
                this.getPicture(0); // 0 == Library
            }
            },{
            text: 'Tomar Foto',
            handler: () => {
                this.getPictureCamera(); // 1 == Camera
            }
            },{
            text: 'Foto de prueba',
            handler: () => {
                this.srcImage = 'assets/img/2017-10-17.jpeg';
            }
            },{
            text: 'Cancelar',
            role: 'cancel'
            }
        ]
        });
        actionSheet.present();
    }

    getPicture(sourceType: number) {
        const options = {
            quality: 100,
            destinationType: 0, // DATA_URL
            sourceType,
            allowEdit: true,
            saveToPhotoAlbum: false,
            correctOrientation: true
        }

        // You can check the values here:
        // https://github.com/driftyco/ionic-native/blob/master/src/plugins/camera.ts
        this.camera.getPicture(options).then((imageData) => {
            this.srcImage = `data:image/jpeg;base64,${imageData}`;
        }, (err) => {
            console.log(`ERROR -> ${JSON.stringify(err)}`);
        });
    }



    getPictureCamera() {
        this.camera.getPicture({
            sourceType: this.camera.PictureSourceType.CAMERA,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
    //      targetWidth: 1000,
    //      targetHeight: 1000
        }).then((imageData) => {
            this.srcImage = `data:image/jpeg;base64,${imageData}`;
        }, (err) => {
            console.log(err);
        });
    }

    send() {
      let loader: any;
      loader = this.loadingCtrl.create({
        content: 'Enviando... '
      })
      loader.present();
      this.receiptscanProvider.send(this.data).subscribe(
          data =>{
              loader.dismiss();
              let alert = this.alertCtrl.create({
              title: "Perfecto",
              subTitle: "Datos enviados con exito",
              buttons: ['OK']
              });
              alert.present();
              console.log(data);
          },err =>{
              loader.dismiss();
              let alert = this.alertCtrl.create({
              title: "Error",
              subTitle: "Revise su conexión",
              buttons: ['OK']
              });
              alert.present();
              loader.dismiss();
          }
      );
    }

    recognizeText() {
        var prueba: boolean = true ;
        var object = this;
        let loader: any;
        var apellido =  "";
        var nombre =  "";
        var direccion =  "";
        var edad =  "";
        var sexo =  "";
        var curp =  "";
        var obj = this;



        setTimeout(function(){
          Tesseract.recognize(this.srcImage, {
          // Tesseract.recognize('',{
              lang: 'spa',
              tessedit_char_blacklist: 'e'
          })
          .progress(function  (p) {
            var progress = p.progress * 100;
            console.log('progress', loader);
              if(prueba){
                  loader = object.loadingCtrl.create({
                    content: 'Procesando... '
                  })
                  loader.present();
              }

  console.log(loader);
              prueba = false;

            })
           .then(function(result){
               console.log(result);
               var text = result.text;
               var nombre_obj = text.split('\n');

               console.log('********', nombre_obj);

               //  ***************************************************** nombre 1
               var not_found=true;
               var nombre_obj_back = nombre_obj.slice(0);
               while(not_found){
                //  debugger;
                try {
                  if (nombre_obj[0].indexOf("NOMBRE") > -1){
                    not_found = false;
                  }
                } catch (e) {
                  not_found = false;
                  nombre_obj =nombre_obj_back;
                  var index = 0;
                  while(index < 5){
                    var has_word = false;
                    for (var j = 0; j < nombre_obj[0].length; j++) {
                      if (nombre_obj[0][j] == nombre_obj[0][j].toUpperCase()){
                        has_word = true;
                        break;
                      }
                    }
                    if (has_word){
                      break;
                    }else{
                      nombre_obj.shift();
                    }
                    index += 1;
                  }
                }
                nombre_obj.shift()
               }
               console.log('222222', nombre_obj);
               for (var i = 0; i < nombre_obj.length; i++) {
                 nombre_obj[i] = nombre_obj[i].split("EDAD")[0];
                 nombre_obj[i] = nombre_obj[i].split("SEXO")[0];
               }
               var nombre_text = nombre_obj[0] + nombre_obj[1] + nombre_obj[2]; //+nombre_obj[7]; //nombre_obj[2] +
               var direccion_text = nombre_obj[4] + nombre_obj[5] + nombre_obj[6] + nombre_obj[7] + nombre_obj[8];
               direccion_text = direccion_text.split("FGLIO")[0].split("CLAVE")[0]
                 function isLetter(str) {
                   return str.length === 1 && str.match(/[a-z]/i);
                 }
                 var after_space = 1;
                 for (var i = 0; i < nombre_text.length; i++) {
                   if ((nombre_text[i] == nombre_text[i].toUpperCase() && isLetter(nombre_text[i])) || (nombre_text[i] == " ") ){
                      nombre += nombre_text[i];
                   }
                   if (nombre_text[i] == " ") {
                     after_space = 1;
                   }else{
                     after_space += 1;
                   }
                 }
                 nombre = nombre.split(" EN ").join('');
                //  FIN NOMBRE *****************************************************
               for (var i = 0; i < direccion_text.length; i++) {
                 if (direccion_text[i] == direccion_text[i].toUpperCase() && (isLetter(direccion_text[i]) || direccion_text[i] == " " || direccion_text[i] == "/" || direccion_text[i] == "0" || parseInt(direccion_text[i])) ){
                   direccion += direccion_text[i];
                 }
               }
               // FIN DIRECCION ******************************************
               for(var i=0;i<result.words.length;i++){
                  if(i<10)
                  {
                      if(Number(result.words[i].text) > 1){

                          edad = result.words[i].text
                      }
                      if(result.words[i].text == "H" || result.words[i].text == "M"){

                          sexo = result.words[i].text
                      }
                  }

                  if(result.words[i].text=="NOMBRE"){
                      apellido = result.words[i+1].text;
                      console.log("Apellido: "+apellido)
                  }
                  if(result.words[i].text=="CURP"){
                      curp = result.words[i+1].text
                      console.log("Curp: "+curp);
                  }
              }
              if (curp == "" || curp == " "){
                // var curp_text = nombre_obj[8];
                var curp_obj = nombre_obj[8].split(" ");
                var j = 0;
                var last_length = 0;
                for (var i = 0; i < curp_obj.length; i++) {
                  var l = curp_obj[i].length;
                  console.log(l);
                  if (curp_obj[i].length > last_length){
                    last_length = curp_obj[i].length
                    j = i;
                  }
                  // if (curp_text[i] == curp_text[i].toUpperCase() && isLetter(curp_text[i]) ){
                  //   if (curp_text[i+1] != " ")
                  //     curp += curp_text[i];
                  // }
                }
                var curp_text = curp_obj[j];
                for (var i = 0; i < curp_text.length; i++) {
                  if (curp_text[i] == curp_text[i].toUpperCase() && isLetter(curp_text[i]) ){
                      curp += curp_text[i];
                  }
                }
              }
              let data: any;
              object.data = {
                  "nombre": nombre,
                  "direccion": direccion,
                  "sexo": sexo,
                  "edad": edad,
                  "crup": curp
              }
              loader.dismiss();
              object.imgProcesada = true;


          })
        },3000)



    }

    restart() {
        this.srcImage = '';
        this.imgProcesada = false;
        this.data = {};
        this.presentActionSheet();
    }

}
