import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MigrateRequest, MigrateResponse } from './types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MigrateApiService {
  // Cambia esto si usas otro puerto/host
  private readonly baseUrl = 'http://localhost:3000/api/migrate';

  constructor(private http: HttpClient) {}

  migrate(payload: MigrateRequest): Observable<MigrateResponse> {
    return this.http.post<MigrateResponse>(this.baseUrl, payload);
  }
}