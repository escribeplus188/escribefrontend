import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MenuItem } from 'primeng/api';

import { NotificacionesService } from 'src/app/services/funciones/notificaciones.service';
import { CursoService } from 'src/app/services/academics/curso/curso.service';


@Component({
  selector: 'app-curso',
  templateUrl: './curso.component.html',
  styleUrls: ['./curso.component.css'],
})
export class CursoComponent implements OnInit {

  
  @Input() Curso: any = {};

  public MenuLeeciones: MenuItem[] = [];


  public datosLeccion: any = {};

  public datosCurso: any = {};

  public cargandoContenido: boolean = false;
  public modoExamen: string = "facil";

  url: string = 'https://www.youtube.com/embed/QATzS1Hh0dQ';
  public urlSafe: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private notificacionesService: NotificacionesService,
    private cursoService: CursoService
  ){
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  ngOnInit(): void {

    this.getCursoContenido();

  }

  //////////////////////////////////////////////////////////////////////////////////
  // funciones generales

      public getCursoContenido(){

        this.cargandoContenido = true; 

        this.cursoService.postObtenerContenidoCurso( this.Curso.tipo ).subscribe({
          next: ( response: any ) => { this.nextGetCursoContenido( response ); },
          error: ( error: any ) => { this.notificacionesService.showError( error.error.message ); },
          complete: () => { this.cargandoContenido = false; }
        })

      }

      public nextGetCursoContenido(response: any) {
        if (!response.valid) {
          this.notificacionesService.showError(response.message);
          return;
        }
      
        this.datosCurso = response.data;
      
        this.datosCurso.lecciones_contenido.map((leccionContenido: any) => {
          leccionContenido.miniLecciones = leccionContenido.miniLecciones.map((miniLeccion: any) => {
            return miniLeccion;
          });
      
          this.MenuLeeciones.push({
            label: leccionContenido.titulo,
            command: (event: any) => {
              this.asignarLeccion(leccionContenido);
            },
            disabled: leccionContenido.deshabilitado,
          });
        });
      
        this.asignarLeccion(this.datosCurso.lecciones_contenido[0]);
        this.cargandoContenido = false;
      }


  //////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////
  // funciones de estetica

    /**
     * 
     * 
    */

    public sanitizarURL(contenido: string | undefined) {
      if (!contenido) {
          return this.sanitizer.bypassSecurityTrustResourceUrl('');  // Retorna una URL vacía o un valor por defecto
      }
   
      let newUrl = contenido;
   
      if (contenido.includes('drive.google.com')) {
          newUrl = contenido.replace('view?usp=sharing', 'preview');
      }
   
      if (contenido.includes('youtu.be')) {
          const videoId = contenido.split('youtu.be/')[1];
          newUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (contenido.includes('youtube.com/watch')) {
          const videoId = new URL(contenido).searchParams.get('v');
          if (videoId) {
              newUrl = `https://www.youtube.com/embed/${videoId}`;
          }
      }
   
      return this.sanitizer.bypassSecurityTrustResourceUrl(newUrl);
   }

      public ValidarEvento( event: any){

        let mini = this.datosLeccion.mini_lecciones[ event.index ];

        if( mini.tipo == 'video'){
          this.urlSafe =  this.sanitizer.bypassSecurityTrustResourceUrl( mini.contenido );
        }

        if (mini.tipo == 'texto' && mini.video) {
          const videoId = mini.video.split('youtu.be/')[1]; // Extraer el ID del video
          this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
        }

      }

      public ActualizarContenidoLeccion( event: any ){

        if( event == true ){
          this.getCursoContenido();
        }

      }

      public ActualizarLecciones() {
        this.cursoService.postObtenerContenidoCurso(this.Curso.tipo).subscribe({
          next: (response: any) => {
            if (response.valid) {
              const leccionAnterior = this.datosLeccion ? this.datosLeccion.nombre_leccion : null;
              
              this.datosCurso = response.data;
              this.MenuLeeciones = [];
      
              this.datosCurso.lecciones_contenido.map((leccionContenido: any) => {
                // Actualiza el estado de las lecciones, habilitando las desbloqueadas
                this.MenuLeeciones.push({
                  label: leccionContenido.titulo,
                  command: (event: any) => {
                    this.asignarLeccion(leccionContenido);
                  },
                  disabled: leccionContenido.deshabilitado,
                });
              });
      
              // Si hay una lección previa, la seleccionamos, si no, seleccionamos la primera disponible
              const leccionDesbloqueada = this.datosCurso.lecciones_contenido.find((l: any) => l.titulo === leccionAnterior);
              
              if (leccionDesbloqueada) {
                this.asignarLeccion(leccionDesbloqueada);
              } else {
                this.asignarLeccion(this.datosCurso.lecciones_contenido[0]);
              }
            }
          },
          error: (error: any) => {
            this.notificacionesService.showError(error.error.message);
          },
        });
      }
      
      public asignarLeccion(leccionContenido: any) {
        this.datosLeccion = {
          nombre_leccion: leccionContenido.titulo,
          descripcion_leccion: leccionContenido.descripcion_leccion || "",
          mini_lecciones: [...leccionContenido.miniLecciones, ...leccionContenido.evaluacion],
        };
        console.log(this.datosLeccion);
      }

      public toggleContenido(mini_leccion: any) {
        mini_leccion.activo = !mini_leccion.activo;
      }

      onChangeModoExamen() {
        console.log(`Modo de examen cambiado a: ${this.modoExamen}`);
    }

  //////////////////////////////////////////////////////////////////////////////////


}
