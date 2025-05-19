import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post.service';
import { User } from './user.service';

// Define Comment model
export interface Comment {
  commentId?: number;
  post: Post;
  user: User;
  text: string;
  picture?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = 'http://localhost:9090/comments'; // Base path

  constructor(private http: HttpClient) {}

  // Get all comments for a specific post
  getCommentsForPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/post/${postId}`);
  }

  // Get all comments made by a specific user
  getCommentsByUser(userId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/user/${userId}`);
  }

  // Add a comment to a post using the correct backend URL
  addCommentToPost(postId: number, userId: number, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/create/${postId}/${userId}`,
      comment
    );
  }

  // Delete a comment by ID
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${commentId}`, { responseType: 'text' as 'json' });
  }
  
  updateComment(commentId: number, comment: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/update/${commentId}`, comment);
  }

}
