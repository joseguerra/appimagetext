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
    public progreso: number =  0
    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                public actionSheetCtrl: ActionSheetController,
                public receiptscanProvider :Receiptscan,
                public loadingCtrl: LoadingController,
                public camera: Camera,
                public alertCtrl: AlertController) {
                    
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
                this.srcImage = 'assets/img/captura.png';
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

    recognizeText() {
        var prueba: boolean = true ;
        var object = this;
        let loader: any;
        var apellido =  "";
        var nombre =  "";
        var edad =  "";
        var sexo =  "";
        var curp =  "";
        
        Tesseract.recognize(this.srcImage, {
            lang: 'spa',
            tessedit_char_blacklist: 'e'
        })
        .progress(function  (p) {
            
            if(prueba){
                loader = object.loadingCtrl.create({
        	        content: 'Procesando... '
      	        })
                loader.present();
            }
      	        
            prueba = false;

             console.log('progress', p)    })
         .then(function(result){
             console.log(result)
             for(var i=0;i<result.words.length;i++){                 
                if(result.words[i].text=="NOMBRE"){
                    apellido = result.words[i+1].text;
                    console.log("Apellido: "+apellido)
                }
                if(result.words[i].text=="CURP"){
                    curp = result.words[i+1].text
                    console.log("Curp: "+curp);
                }
                if(result.words[i].text=="EDAD"){
                    edad = result.words[i+1].text
                    console.log("Edad: "+edad);
                }
                if(result.words[i].text=="saxo"){
                    sexo = result.words[i+1].text
                    console.log("Sexo: "+sexo);
                    for(var j=2;j<4;j++){
                        if(result.words[i+j].text!="DOMICILIO")
                            nombre += result.words[i+j].text + " "
                            
                    }
                    console.log("Nombre: "+nombre);
                    
                
                }
                
            }
            let data: any;
            data = {
                "nombre": nombre,
                "apellido": apellido,
                "sexo": sexo,
                "edad": edad,
                "crup": curp
            } 
            object.receiptscanProvider.send(data).subscribe(
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
