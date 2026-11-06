import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NailApiService, NailService, Appointment } from '../../services/nail-api.service';

@Component({selector:'app-salon',standalone:true,imports:[CommonModule,FormsModule,IonicModule],
templateUrl:'./salon.page.html',styleUrls:['./salon.page.scss']})
export class SalonPage implements OnInit {
  screen: 'services'|'book'|'appointments'|'profile' = 'services';
  services: NailService[]=[]; appointments: Appointment[]=[];
  chosen=0; date=''; time=''; notes=''; editingId:number|null=null;
  busy=false; profileName=''; profilePhone='';
  get user() { return this.api.user; }
  get selected() { return this.services.find(s=>s.id===Number(this.chosen)); }
  constructor(public api:NailApiService,private router:Router,private loadingCtrl:LoadingController,private toastCtrl:ToastController,private alertCtrl:AlertController) {}
  async ngOnInit() { this.profileName=this.user?.name||''; this.profilePhone=this.user?.phone||''; await this.loadServices(); if(this.user) await this.loadAppointments(); }
  async run<T>(message:string, task:()=>Promise<T>):Promise<T|undefined> {
    if(this.busy) return undefined;
    this.busy=true;
    const loading=await this.loadingCtrl.create({message});
    await loading.present();
    try { return await task(); }
    catch(err) { await this.toast(this.api.error(err),'danger'); return undefined; }
    finally { await loading.dismiss(); this.busy=false; }
  }
  private async toast(message:string,color:'success'|'danger'='success') {
    const toast=await this.toastCtrl.create({message,color,duration:3000,position:'bottom'}); await toast.present();
  }
  async loadServices() { const result=await this.run('Cargando servicios...',()=>this.api.services()); if(result) this.services=result; }
  async loadAppointments() { if(!this.user) return; const result=await this.run('Cargando citas...',()=>this.api.appointments()); if(result) this.appointments=result; }
  openBooking(service?:NailService) {
    if(!this.user) { this.router.navigateByUrl('/login'); return; }
    this.editingId=null; this.chosen=service?.id||this.services[0]?.id||0; this.date=''; this.time=''; this.notes=''; this.screen='book';
  }
  edit(a:Appointment) {
    this.editingId=a.id; this.chosen=a.service_id; this.date=a.start_at.slice(0,10); this.time=a.start_at.slice(11,16); this.notes=a.notes; this.screen='book';
  }
  async saveBooking() {
    if(!this.chosen||!this.date||!this.time) { await this.toast('Selecciona servicio, fecha y hora','danger'); return; }
    const payload={service_id:Number(this.chosen),start_at:this.date+' '+this.time+':00',notes:this.notes};
    const saved=await this.run('Guardando cita...',()=>this.editingId ? this.api.reschedule(this.editingId,payload) : this.api.book(payload));
    if(saved) { await this.toast(this.editingId?'Cita reprogramada':'Cita agendada'); this.screen='appointments'; await this.loadAppointments(); }
  }
  async cancel(a:Appointment) {
    const alert=await this.alertCtrl.create({header:'Cancelar cita',message:'¿Deseas cancelar esta cita?',buttons:[{text:'Volver',role:'cancel'},{text:'Cancelar cita',role:'destructive',handler:()=>{void this.confirmCancel(a.id);}}]}); await alert.present();
  }
  private async confirmCancel(id:number) { const result=await this.run('Cancelando cita...',()=>this.api.cancel(id)); if(result) { await this.toast('Cita cancelada'); await this.loadAppointments(); } }
  async editNotes(a:Appointment) {
    const alert=await this.alertCtrl.create({header:'Editar notas',inputs:[{name:'notes',type:'textarea',value:a.notes}],buttons:[{text:'Cerrar',role:'cancel'},{text:'Guardar',handler:(d)=>{void this.saveNotes(a.id,d.notes);}}]});await alert.present();
  }
  private async saveNotes(id:number,notes:string) { const result=await this.run('Guardando notas...',()=>this.api.editNotes(id,notes)); if(result) {await this.toast('Notas actualizadas'); await this.loadAppointments();} }
  async saveProfile() { const result=await this.run('Actualizando perfil...',()=>this.api.updateProfile(this.profileName,this.profilePhone).then(()=>true)); if(result) await this.toast('Perfil actualizado'); }
  async logout() { await this.run('Cerrando sesión...',()=>this.api.logout()); await this.router.navigateByUrl('/login'); }
  async switchScreen(next:'services'|'book'|'appointments'|'profile') { this.screen=next; if(next==='appointments') await this.loadAppointments(); }
  canEdit(a:Appointment) { return a.status==='scheduled' && new Date(a.start_at.replace(' ','T')).getTime()>Date.now(); }
}
