import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ProfesorReporteService {


  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient
  ){}

  public getReporte( datosSolicitud: any ) : any {
    return this.http.post( this.apiUrl + '/api/cursos/reporte_curso',  datosSolicitud );
  }


  // metodos locales de funciones genereales

  /***
   * 
   * Método para generar el PDF
   *
   *  
  */
    descargarPDF( datosImpresion: any ){

      const doc = new jsPDF();

      let columnas: string[] = Object.keys( datosImpresion[0] ); 

      const filas = datosImpresion.map( ( dato: any ) =>  { 

        let arreglo: any[] = [];
        columnas.map( ( col : string ) => { arreglo.push( dato[col] ) } );

        return arreglo;
        
      });
  
      autoTable(doc, {
        head: [columnas],
        body: filas
      });
  
      // Descargar el PDF
      doc.save("listado_cursos.pdf");
    }

}
