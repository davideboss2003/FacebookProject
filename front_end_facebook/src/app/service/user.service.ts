import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userId?: number;
  name: string;
  email: string;
  phoneNumber: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  score?: number;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:9090/users'; // adjust if BE runs on another port

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAll`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/createUser`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/updateUser/${id}`, user);
  }

  login(loginData: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, loginData);
  }

  getUserScore(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${userId}/score`);
  }

  banUser(userId: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}/unban`, {});
  }

}
