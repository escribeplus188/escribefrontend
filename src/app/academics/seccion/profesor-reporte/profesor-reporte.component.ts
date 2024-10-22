import { Component, OnInit } from '@angular/core';


import { NotificacionesService } from 'src/app/services/funciones/notificaciones.service';
import { ProfesorReporteService } from 'src/app/services/academics/profesor-reporte.service';


@Component({
  selector: 'app-profesor-reporte',
  templateUrl: './profesor-reporte.component.html',
  styleUrls: ['./profesor-reporte.component.css']
})
export class ProfesorReporteComponent implements OnInit {

  public listaCursosReporte: any[] = [];
  public listaCursosReporteFiltrado: any[] = [];

  public banderaCargaDatos: boolean = false;

  public fechaInicio: Date | null = null;
  public fechaFin: Date | null = null;

  constructor(
    private notificacionesService: NotificacionesService,
    private profesorReporteService: ProfesorReporteService
  ){}

  ngOnInit(): void {
    this.getReporte();
  }

  //////////////////////////////////////////////////////////////////////////////////
  // metodos generales
  
    /**
     * 
     * el nombre del curso,
     * la cantidad de alumnos que tiene -> inscritos
     * la cantidad de alumnos que se han salido del curso -> desasignado
     * la cantidad de alumnos expulsados del curso -> bloqueados
     * la cantidad de alumnos que han logrado terminar el curso por completo -> completado 
     * 
     * la cantidad total de lecciones que se han completado en ese curso en total
     * (sumatoria de lecciones que han completado todos los alumnos del curso en plan 
     * si solo hay dos alumnos en un curso y uno completo 20 lecciones y el otro 30 que se muestre el total de 50 sin importar que alumno fue)
     * 
    */
      public getReporte(){

        this.banderaCargaDatos = true;


        this.listaCursosReporte = [];
        this.listaCursosReporteFiltrado = [];

        let DatosSolicitud = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin
        }

        this.profesorReporteService.getReporte( DatosSolicitud ).subscribe({
          next: ( response: any ) => { this.nextGetReporte( response ); },
          error: ( error: any ) => { this.notificacionesService.showError( error.error.message ); },
          complete: () => { this.banderaCargaDatos = false; }
        })

      }
  
      public nextGetReporte( response: any ){

        console.log(" datos listado curso ants", this.listaCursosReporte)
        console.log(" datos listado curso ants", this.listaCursosReporteFiltrado)

        if( !response.valid ){

          this.notificacionesService.showError( response.message );
          this.listaCursosReporte = [];
          return;
        }

        this.listaCursosReporte = response.data;

        console.log(" datos listado curso despues", this.listaCursosReporte)

        response.data.map( ( curso: any ) =>{

          let dato: any = {
            nombre: curso.nombre,
            tipoCurso: curso.tipoCurso,
            inscritos: curso?.estudiantes?.length ?? 0,
            bloqueados: curso?.bloqueados?.length ?? 0,
            desasignados: curso?.desasignados?.length ?? 0,
            completados: curso?.completados?.length ?? 0,
            evaluciones_ganadas: curso?.evaluciones_ganadas ?? 0,
            fechaCreacion: curso?.fechaCreacion ?? ""
          }

          this.listaCursosReporteFiltrado.push( dato );

        });

        console.log(" datos listado curso filtro despues", this.listaCursosReporteFiltrado );

      }

  //////////////////////////////////////////////////////////////////////////////////
  
  //////////////////////////////////////////////////////////////////////////////////
  // metodos de funcion 
  
      /***
       * 
       * servicio descargar reporte 
       * 
      */

      public descargarPDF(){
        this.profesorReporteService.descargarPDF( this.listaCursosReporteFiltrado );
      }

      public limpiarFiltros() {
        this.fechaInicio = null;
        this.fechaFin = null;
        this.getReporte();
      }

  //////////////////////////////////////////////////////////////////////////////////

}
