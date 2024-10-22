import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    public uploadSignature(imageData: string, evalId: string) {
        const uploadURL = `/api/evaluaciones/upload-image/${evalId}`;
        return this.http.post(this.apiUrl + uploadURL, { image: imageData }, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}