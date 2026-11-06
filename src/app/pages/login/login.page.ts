import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NailApiService } from '../../services/nail-api.service';
@Component({selector:'app-login',standalone:true,imports:[CommonModule,FormsModule,IonicModule],templateUrl:'./login.page.html',styleUrls:['./login.page.scss']})
export class LoginPage {
  name=''; phone=''; email=''; password=''; registerMode=false; busy=false;
  constructor(private api:NailApiService,private router:Router,private loaderCtrl:LoadingController,private toastCtrl:ToastController){}
  async submit() {
    if(!this.email||!this.password||(this.registerMode&&!this.name)) return this.toast('Completa los campos','danger');
    if(this.busy)return;
    this.busy=true;
    const loading=await this.loaderCtrl.create({message:this.registerMode?'Creando cuenta...':'Iniciando sesión...'});
    await loading.present();
    try {
      if(this.registerMode) { await this.api.register({name:this.name,phone:this.phone,email:this.email,password:this.password}); this.registerMode=false; await this.toast('Cuenta creada. Inicia sesión.','success'); }
      else { await this.api.login(this.email,this.password); await this.router.navigateByUrl('/salon',{replaceUrl:true}); }
    } catch(e) { await this.toast(this.api.error(e),'danger'); }
    finally {await loading.dismiss();this.busy=false;}
  }
  private async toast(message:string,color:'success'|'danger') { const t=await this.toastCtrl.create({message,color,duration:3000});await t.present(); }
}
