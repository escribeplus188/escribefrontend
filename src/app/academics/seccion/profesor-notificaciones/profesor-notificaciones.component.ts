import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotifiacionUsuariosService } from 'src/app/services/academics/notifiacion-usuarios.service';
import { NotificacionesService } from 'src/app/services/funciones/notificaciones.service';

@Component({
  selector: 'app-profesor-notificaciones',
  templateUrl: './profesor-notificaciones.component.html',
  styleUrls: ['./profesor-notificaciones.component.css']
})
export class ProfesorNotificacionesComponent  implements OnInit{

  @Output() cambioDeComponente = new EventEmitter<any>();

  public cargandoNotificaciones: boolean = false;

  public listaNotificiacones: any[] = [];

  
  public mensajeNotificacionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notificacionesService: NotificacionesService,
    private notifiacionUsuariosService: NotifiacionUsuariosService
  ){

    this.mensajeNotificacionForm = this.fb.group({
      correoReceptor: [ '', [ Validators.required, Validators.email ] ],
      contenido:      [ '', [ Validators.required ] ]
    });

  }

  ngOnInit(): void {
      this.obtenerNotifacioens();
  }
  
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // funciones generales

      /***
       * 
       * 
      */
  
      public obtenerNotifacioens( ){
      
        this.cargandoNotificaciones = true;
  
        this.notifiacionUsuariosService.getNotifcicaciones( ).subscribe({
          next: ( response: any ) => { this.nextObtenerNotifacioens( response ); },
          error: ( error: any ) => { this.notificacionesService.showError( error.error.message ); },
          complete: () => { this.cargandoNotificaciones = false; }
        })
        
      }
  
      public nextObtenerNotifacioens( response : any ){
  
        if( !response.valid ){
          this.notificacionesService.showError( response.message );
          this.listaNotificiacones = [];
          return;
        }
  
        this.listaNotificiacones = response.notifcaciones;
  
      }

      public NotifacioensLeida( notificacion_id: any ){
      
        this.cargandoNotificaciones = true;
  
        let datos = {
          notificacion_id
        }
  
        this.notifiacionUsuariosService.postNotificacionLeida( datos ).subscribe({
          next: ( response: any ) => { this.nextObtenerNotifacioens( response ); },
          error: ( error: any ) => { this.notificacionesService.showError( error.error.message ); },
          complete: () => { this.cargandoNotificaciones = false; this.obtenerNotifacioens() }
        })
        
      }
  
      public nextNotifacioensLeida( response : any ){
  
        if( !response.valid ){
          this.notificacionesService.showError( response.message );
          this.listaNotificiacones = [];
          return;
        }
  
      }


      public mandarMensaje(){

        this.notifiacionUsuariosService.postMandarMensaje( this.mensajeNotificacionForm.value ).subscribe({
          next: ( response: any ) => { this.nextMandarMensaje( response ); },
          error: ( error: any ) => { this.notificacionesService.showError( error.error.message ); },
          complete: () => { }
        })

      }

      public nextMandarMensaje( response : any ){

        if( !response.valid ){
          this.notificacionesService.showError( response.message );
          return;
        }

        this.notificacionesService.showSuccess( response.message );



      }

  
    

    //////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // funciones esteticas

    public CambiarComponente(notificacion: any) {
      if (notificacion.notificacion.tipoNotificacion === 'Calificar') {
        this.cambioDeComponente.emit({
          nombre_compoennte: 'evaluar_curso',
          CursoEvaluacion: {
            tipo: {
              emisor: notificacion.emisor,
              notificacion: notificacion.notificacion
            }
          }
        });
      }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////


}
