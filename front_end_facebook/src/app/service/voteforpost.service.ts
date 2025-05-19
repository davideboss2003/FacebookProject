import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type VoteType = 'UPVOTE' | 'DOWNVOTE';

export interface VoteForPost {
  voteId?: number;
  userId: number;
  postId: number;
  voteType: VoteType;
}

@Injectable({
  providedIn: 'root',
})
export class VoteForPostService {
  private baseUrl = 'http://localhost:9090/votes';

  constructor(private http: HttpClient) {}

  // Add a vote to a post
  addVoteToPost(postId: number, userId: number, voteType: VoteType): Observable<any> {
    const url = `${this.baseUrl}/add/${postId}/${userId}?voteType=${voteType}`;
    return this.http.post<any>(url, {});
  }

  // Get net vote count (upvotes - downvotes)
  getVoteCountForPost(postId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/${postId}`);
  }

  // Remove a user's vote for a post
  removeVoteFromPost(postId: number, userId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/remove/${postId}/${userId}`);
  }

  // ✅ Remove all votes for a post (newly added)
  removeAllVotesFromPost(postId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/remove/all/${postId}`, { responseType: 'text' });
  }
  
  // Get the current user's vote type for a post
  getUserVoteType(postId: number, userId: number): Observable<VoteType | null> {
    const url = `${this.baseUrl}/user-vote/${postId}/${userId}`;
    return this.http.get<VoteType>(url, { observe: 'response' }).pipe(
      map(response => response.status === 204 ? null : response.body!)
    );
}

  
}
