import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { MigrateRequest, MigrateResponse } from './types';

@Injectable({ providedIn: 'root' })
export class MigrateApiService {
  private readonly baseUrl = environment.migrateApiBaseUrl;

  constructor(private http: HttpClient) {}

  migrate(payload: MigrateRequest): Observable<MigrateResponse> {
    return this.http.post<MigrateResponse>(this.baseUrl, payload);
  }
}