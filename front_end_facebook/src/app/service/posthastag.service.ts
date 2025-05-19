import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post.service';
import { Tag } from './tag.service';

// Define the structure for PostHasTag based on BE entity
export interface PostHasTag {
  id?: number;
  post: Post;
  tag: Tag;
}


@Injectable({
  providedIn: 'root',
})
export class PostHasTagService {
  private baseUrl = 'http://localhost:9090/post-tags'; // Adjust the URL if needed

  constructor(private http: HttpClient) {}

  // Get tags for a post by postId
  getTagsForPost(postId: number): Observable<PostHasTag[]> {
    return this.http.get<PostHasTag[]>(`${this.baseUrl}/post/${postId}`);
  }

  // Get posts for a tag by tagId
  getPostsForTag(tagId: number): Observable<PostHasTag[]> {
    return this.http.get<PostHasTag[]>(`${this.baseUrl}/tag/${tagId}`);
  }

  // Add a tag to a post
  addTagToPost(postId: number, tagId: number): Observable<PostHasTag> {
    return this.http.post<PostHasTag>(`${this.baseUrl}/add?postId=${postId}&tagId=${tagId}`, {});
  }

  // Remove a tag from a post
  // Fix by adding { responseType: 'text' as 'json' }
  removeTagFromPost(postId: number, tagId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/remove?postId=${postId}&tagId=${tagId}`, {
    responseType: 'text' as 'json'
  });
}

}
