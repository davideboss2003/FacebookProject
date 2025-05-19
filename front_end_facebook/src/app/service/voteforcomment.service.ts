import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type VoteType = 'UPVOTE' | 'DOWNVOTE';

export interface VoteForComment {
  voteId?: number;
  userId: number;
  commentId: number;
  voteType: VoteType;
}

@Injectable({
  providedIn: 'root',
})
export class VoteForCommentService {
  private baseUrl = 'http://localhost:9090/comment-votes';

  constructor(private http: HttpClient) {}

  // Add a vote to a comment
  addVoteToComment(commentId: number, userId: number, voteType: VoteType): Observable<VoteForComment> {
    const url = `${this.baseUrl}/add/${commentId}/${userId}?voteType=${voteType}`;
    return this.http.post<VoteForComment>(url, {});
  }

  // Get net vote count (upvotes - downvotes)
  getVoteCountForComment(commentId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/${commentId}`);
  }

  // Remove a user's vote for a comment
  removeVoteFromComment(commentId: number, userId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/remove/${commentId}/${userId}`, {
      responseType: 'text'
    });
  }
  

  // Get list of user IDs who voted on a comment
  getUserIdsWhoVotedOnComment(commentId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/voters/${commentId}`);
  }

  getUserVoteType(commentId: number, userId: number): Observable<VoteType | null> {
    const url = `${this.baseUrl}/user-vote/${commentId}/${userId}`;
    return this.http.get<VoteType>(url, { observe: 'response' }).pipe(
      map(response => response.status === 204 ? null : response.body!)
    );
  }

}
