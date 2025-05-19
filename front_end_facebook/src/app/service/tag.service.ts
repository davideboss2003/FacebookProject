import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tag {
  tagId?: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private baseUrl = 'http://localhost:9090/tags'; // Adjust if needed

  constructor(private http: HttpClient) {}

  // Get all tags
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/getAll`);
  }

  // Create a new tag
  createTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`${this.baseUrl}/createTag`, tag);
  }

  // Delete a tag by ID
  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
