import { Component, Input, OnInit, AfterViewInit, AfterViewChecked, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';

import { NotificacionesService } from 'src/app/services/funciones/notificaciones.service';
import { CalificarCursoService } from 'src/app/services/academics/curso/calificar-curso.service';
import { ImageUploadService } from 'src/app/services/funciones/image-upload.service';
import { environment } from 'src/environments/environment';

import SignaturePad from 'signature_pad';

interface Pregunta {
  pregunta: string;
  tipo: string;
  opciones?: Opcion[];
  linkIntroducido?: string;
}

interface Opcion {
  texto: string;
  correcta: boolean;
}

@Component({
  selector: 'app-calificar-curso',
  templateUrl: './calificar-curso.component.html',
  styleUrls: ['./calificar-curso.component.css']
})
export class CalificarCursoComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @Output() ActualizarLeccionContenido = new EventEmitter<Boolean>();

  @Input() test: any  = {};
  @Input() curso: any  = {};
  @Input() modoExamen: String = 'facil';

  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef<HTMLCanvasElement>;

  signaturePad!: SignaturePad;
  signatureImage: string | null = null;
  imageLoaded: boolean = false;

  // Declaración del contador y arreglo de respuestas
  public puntaje: number = 0;
  public respuestasSeleccionadas: any[] = [];

  public isButtonDisabled: boolean = false;

  public ponderacionPorPregunta: number = 0;

  constructor(
    private notificacionesService: NotificacionesService,
    private calificarCursoService: CalificarCursoService,
    private imageUploadService: ImageUploadService
  ){}

  ngAfterViewInit(){
    this.initSignaturePad();
  }

  ngAfterViewChecked() {
    this.initSignaturePad();
  }

  initSignaturePad() {
    if (this.signatureCanvas && !this.signaturePad) {
      const canvas = this.signatureCanvas.nativeElement;
      this.signaturePad = new SignaturePad(canvas);
    }
  }

  ngOnInit(): void {

    this.ponderacionPorPregunta = 100 / this.test.cuestionario.length;
    this.test.cuestionario.forEach((pregunta: Pregunta) => {
      if (!this.respuestasSeleccionadas.some(r => r.pregunta.pregunta === pregunta.pregunta)) {
        this.respuestasSeleccionadas.push({
          pregunta: pregunta,
          opcion: { texto: '', correcta: false },
          linkIntroducido: pregunta.linkIntroducido
        });
      }
    });

    console.log("ponderacion por pregunta ", this.ponderacionPorPregunta);

    if (this.test.evaluacionGanada) {
      const imageUrl = `${environment.apiUrl}/uploaded-images/${this.test.id}.png`;
      this.checkImageExists(imageUrl);
    }
  }

  checkImageExists(url: string): void {
    const img = new Image();
    img.onload = () => {
      this.signatureImage = url;
      this.imageLoaded = true;
    };
    img.onerror = () => {
      this.signatureImage = null;
      this.imageLoaded = false;
    };
    img.src = url;
  }

  //////////////////////////////////////////////////////////////////////////////////
  // funcioens de comunicacion

    /**
     *
     *  
    */
    public enviaExamen() {
      let objeto: any = {
        curso: this.curso,
        evaluacion: {
          evaluacionId: this.test.id,
          enlaceResultado: '',
          cuestionarioEstudiante: this.respuestasSeleccionadas,
          ponderacion: this.puntaje
        }
      };
    
      console.log('Datos a enviar:', objeto);
    
      this.isButtonDisabled = true;
    
      this.calificarCursoService.postEntregarExamen(objeto).subscribe({
        next: (response: any) => {
          this.nextEnviaExamen(response);
        },
        error: (error: any) => {
          console.log(error);
          this.notificacionesService.showError(error.error.message);
        },
        complete: () => {
          this.isButtonDisabled = false;
        }
      });
    }

      public nextEnviaExamen( response: any ){

        if( !response.valid ){

          this.notificacionesService.showError( response.message );
          return;

        }

        if( response.aprobado ){
          this.notificacionesService.showSuccess( response.aprobadoMensaje );
          this.ActualizarLeccionContenido.emit( response.aprobado );
        }else{
          this.notificacionesService.showError( response.aprobadoMensaje );
        }



       }

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  // funcioenes estetica 

    get cuestionarioSeleccionado() {
      this.ponderacionPorPregunta = 100 / ( this.modoExamen === 'facil' ? this.test.cuestionario.length : ( this.test?.cuestionarioDificil?.length ?? 100) );
      return this.modoExamen === 'facil' ? this.test.cuestionario : this.test.cuestionarioDificil;
    }
    /**
     * 
     * @param pregunta  objeto genreal
     * @param opcion  que se;alo 
    */
      public responderPregunta(pregunta: any, opcion: any) {
      
        const respuestaExistente = this.respuestasSeleccionadas.find( (r) => r.pregunta.pregunta === pregunta.pregunta );
      
        if (respuestaExistente) {
          
          if (respuestaExistente.opcion.correcta !== opcion.correcta) {
            this.puntaje += opcion.correcta ? this.ponderacionPorPregunta : -(this.ponderacionPorPregunta);
            respuestaExistente.opcion = opcion;
          }

        } else {
          
          if (opcion.correcta) {
            this.puntaje += this.ponderacionPorPregunta;
          }
      
          
          this.respuestasSeleccionadas.push({
            pregunta: pregunta,
            opcion: opcion
          });
        }

        console.log(" Pregunta ", pregunta)
        console.log(" opcion ", opcion)
        console.log(" puntaje ", this.puntaje)
      
        // Mostramos el puntaje actualizado
        
      }

    /////////////////////////////////////

    public responderPreguntaCompletar(pregunta: any) {
      console.log("Pregunta ", pregunta);
  
      // Buscar si la respuesta ya está en respuestasSeleccionadas
      const respuestaExistente = this.respuestasSeleccionadas.find(
          (respuesta: any) => respuesta.pregunta === pregunta
      );
  
      // Determinar si la respuesta es correcta o no
      const esCorrecta = pregunta.respuestaIntroducida === pregunta.respuestaCorrecta;
  
      if (!respuestaExistente) {
          // Si la respuesta no existe previamente, se agrega y se ajusta el puntaje
          if (esCorrecta) {
              this.puntaje += this.ponderacionPorPregunta;
          } else if (pregunta.respuestaIntroducida !== "") {
              this.puntaje -= this.ponderacionPorPregunta;
          }
  
          // Agregar la respuesta a respuestasSeleccionadas
          this.respuestasSeleccionadas.push({
              pregunta: pregunta,
              opcion: { correcta: esCorrecta }
          });
  
      } else {
          // Si la respuesta ya existe, solo modificar el puntaje según la nueva respuesta
          if (respuestaExistente.opcion.correcta !== esCorrecta) {
              // Ajustar el puntaje solo si ha cambiado la corrección
              if (esCorrecta) {
                  this.puntaje += this.ponderacionPorPregunta;
              } else {
                  this.puntaje -= this.ponderacionPorPregunta;
              }
  
              // Actualizar el valor de correcta en la respuesta existente
              respuestaExistente.opcion.correcta = esCorrecta;
          }
      }
  
      // Mostrar el puntaje actual en la consola
      console.log('Puntaje actual:', this.puntaje);
  }


    // Método para limpiar el canvas
      clearSignature() {
        this.signaturePad.clear();
      }

    // Método para guardar el dibujo como una imagen en base64
    saveSignature(pregunta: any) {
      if (this.signaturePad.isEmpty()) {
        alert('No se ha dibujado nada.');
      } else {
        this.signatureImage = this.signaturePad.toDataURL();
        this.imageUploadService.uploadSignature(this.signatureImage, this.test.id)
          .subscribe({
            next: (response: any) => {
              if(response.valid) {
                this.notificacionesService.showSuccess('Imagen guardada');
    
                const respuestaExistente = this.respuestasSeleccionadas.find(r => r.pregunta.pregunta === pregunta.pregunta && r.pregunta.tipo === pregunta.tipo);
                
                if (respuestaExistente) {
                  respuestaExistente.respuesta = response.fileName;
                } else {
                  const nuevaRespuesta = {
                    pregunta: pregunta,
                    respuesta: response.fileName
                  };
                  this.respuestasSeleccionadas.push(nuevaRespuesta);
                }
              } else {
                this.notificacionesService.showError(response.message);
              }
            },
            error: (error) => {
              this.notificacionesService.showError('Error al guardar la imagen: ' + error);
            }
          });
      }
    }
      

  //////////////////////////////////////////////////////////////////////////////////
}
