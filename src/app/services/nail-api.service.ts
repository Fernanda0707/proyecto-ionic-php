import { Injectable } from '@angular/core';
import axios, { AxiosError, AxiosInstance } from 'axios';
export interface SalonUser { id: number; name: string; email: string; phone: string; role: string; }
export interface NailService { id: number; name: string; description: string; price: number; duration_minutes: number; }
export interface Appointment { id: number; service_id: number; service_name: string; start_at: string; status: string; notes: string; price: number; duration_minutes: number; }
interface Envelope<T> { status: 'success' | 'error'; data: T; message?: string; }
@Injectable({providedIn:'root'})
export class NailApiService {
  // On a physical device use the computer's LAN IP, not localhost.
  private readonly base = 'http://localhost:8000/nails.php';
  private readonly http: AxiosInstance = axios.create({ timeout: 12000 });
  private token = sessionStorage.getItem('nail_token') || '';
  user: SalonUser | null = this.restoreUser();
  private restoreUser(): SalonUser | null {
    try { return JSON.parse(sessionStorage.getItem('nail_user') || 'null'); } catch { return null; }
  }
  private config() { return { headers: { Authorization: 'Bearer ' + this.token } }; }
  error(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError<{message?: string}>;
      if (!err.response) return 'No se pudo conectar con la API. Verifica que PHP esté iniciado.';
      return err.response.data?.message || 'Error HTTP ' + err.response.status;
    }
    return 'Ocurrió un error inesperado';
  }
  private url(resource: string, id?: number) { return this.base + '?resource=' + resource + (id ? '&id=' + id : ''); }
  async register(data: {name:string;email:string;password:string;phone:string}) {
    const r=await this.http.post<Envelope<{id:number}>>(this.url('register'),data); return r.data.data;
  }
  async login(email:string,password:string) {
    const r=await this.http.post<Envelope<{token:string;user:SalonUser}>>(this.url('login'),{email,password});
    this.token=r.data.data.token; this.user=r.data.data.user;
    sessionStorage.setItem('nail_token',this.token); sessionStorage.setItem('nail_user',JSON.stringify(this.user));
    return this.user;
  }
  async logout() {
    try { if(this.token) await this.http.post(this.url('logout'),{},this.config()); }
    finally { this.token=''; this.user=null; sessionStorage.removeItem('nail_token'); sessionStorage.removeItem('nail_user'); }
  }
  async services(): Promise<NailService[]> {
    const r=await this.http.get<Envelope<NailService[]>>(this.url('services')); return r.data.data;
  }
  async appointments(): Promise<Appointment[]> {
    const r=await this.http.get<Envelope<Appointment[]>>(this.url('appointments'),this.config()); return r.data.data;
  }
  async book(data:{service_id:number;start_at:string;notes:string}) {
    const r=await this.http.post(this.url('appointments'),data,this.config()); return r.data;
  }
  async reschedule(id:number,data:{service_id:number;start_at:string;notes:string}) {
    return (await this.http.put(this.url('appointments',id),data,this.config())).data;
  }
  async editNotes(id:number,notes:string) {
    return (await this.http.patch(this.url('appointments',id),{notes},this.config())).data;
  }
  async cancel(id:number) { return (await this.http.delete(this.url('appointments',id),this.config())).data; }
  async updateProfile(name:string,phone:string) {
    await this.http.patch(this.url('profile'),{name,phone},this.config());
    if(this.user) { this.user={...this.user,name,phone}; sessionStorage.setItem('nail_user',JSON.stringify(this.user)); }
  }
}
