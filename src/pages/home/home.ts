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
                this.srcImage = 'assets/img/2017-10-16.png';
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

        Tesseract.recognize(this.srcImage, {
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
            }else{
              loader.data.content ="Procesando " + progress + "%";
              loader.present();
            }

console.log(loader);
            prueba = false;

          })
         .then(function(result){
             console.log(result);
             var text = result.text;
             var nombre_obj = text.split('\n');
             var nombre_text = nombre_obj[2] + nombre_obj[3] + nombre_obj[4] + nombre_obj[5] +nombre_obj[6]+nombre_obj[7]
             var direccion_text = nombre_obj[8] + nombre_obj[9] + nombre_obj[10] + nombre_obj[11];
             console.log(nombre_obj);
             function isLetter(str) {
               return str.length === 1 && str.match(/[a-z]/i);
             }
             for (var i = 0; i < nombre_text.length; i++) {
               if ((nombre_text[i] == nombre_text[i].toUpperCase() && isLetter(nombre_text[i])) || (nombre_text[i] == " ") ){
                 nombre += nombre_text[i];
               }
             }
             for (var i = 0; i < direccion_text.length; i++) {
               if ((direccion_text[i] == direccion_text[i].toUpperCase() && isLetter(direccion_text[i])) || (direccion_text[i] == " ") || (direccion_text[i] == "0") || (parseInt(direccion_text[i])) ){
                 direccion += direccion_text[i];
               }
             }
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
            let data: any;
            console.log(object);
            console.log(obj);

            object.data = JSON.stringify({
                "nombre": nombre,
                "direccion": direccion,
                "sexo": sexo,
                "edad": edad,
                "crup": curp
            })
            object.receiptscanProvider.send(object.data).subscribe(
                data =>{
                    loader.dismiss();
                    let alert = object.alertCtrl.create({
                    title: "Perfecto",
                    subTitle: "Datos enviados con exito",
                    buttons: ['OK']
                    });
                    alert.present();
                    console.log(data);
                },err =>{
                    loader.dismiss();
                    let alert = object.alertCtrl.create({
                    title: "Error",
                    subTitle: "Revise su conexión",
                    buttons: ['OK']
                    });
                    alert.present();
                    loader.dismiss();
                }
            );


        })


    }

    restart() {
        this.srcImage = '';
        this.presentActionSheet();
    }

}
