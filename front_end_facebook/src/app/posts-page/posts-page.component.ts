// posts-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService, Post } from '../service/post.service';
import { TagService, Tag } from '../service/tag.service';
import { PostHasTagService } from '../service/posthastag.service';
import { User, UserService } from '../service/user.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts-page.component.html',
  styleUrls: ['./posts-page.component.css'],
})
export class PostsPageComponent implements OnInit {
  posts: Post[] = [];
  tags: Tag[] = [];
  users: User[] = [];
  postTagsMap: { [postId: number]: Tag[] } = {};

  editingPostId: number | null = null;
  updatedTitle: string = '';
  updatedText: string = '';
  updatedPicture: string = '';
  updatedStatus: 'JUST_POSTED' | 'FIRST_REACTIONS' | 'OUTDATED' = 'JUST_POSTED';

  creatingPost: boolean = false;
  selectedUserId: number | null = null;
  newPostTitle: string = '';
  newPostText: string = '';
  newPostPicture: string = '';
  createdPostId: number | null = null;
  selectedTagIds: number[] = [];
  creatingTag: boolean = false;
  newTagName: string = '';

  constructor(
    private postService: PostService,
    private tagService: TagService,
    private postHasTagService: PostHasTagService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.postService.getAllPosts().subscribe(posts => {
      this.posts = posts;
      posts.forEach(post => {
        this.loadTagsForPost(post.postId!);
      });
    });

    this.tagService.getAllTags().subscribe(tags => {
      this.tags = tags;
    });

    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadTagsForPost(postId: number) {
    this.postHasTagService.getTagsForPost(postId).subscribe(postTags => {
      const tagsForPost: Tag[] = [];
      postTags.forEach(pt => {
        if (pt.tag) tagsForPost.push(pt.tag);
      });
      this.postTagsMap[postId] = tagsForPost;
    });
  }

  getPostTags(postId: number): Tag[] {
    return this.postTagsMap[postId] || [];
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postHasTagService.getTagsForPost(postId).subscribe({
      next: (tags) => {
        if (tags.length === 0) {
          this.postService.deletePost(postId).subscribe(() => {
            this.loadData();
          });
        } else {
          const tagRemovalObservables = tags.map(tag =>
            this.postHasTagService.removeTagFromPost(postId, tag.tag.tagId!)
          );

          forkJoin(tagRemovalObservables).subscribe({
            next: () => {
              this.postService.deletePost(postId).subscribe(() => {
                this.loadData();
              });
            },
            error: (error) => {
              console.error('Failed to remove tags before deleting post:', error);
              alert('An error occurred while trying to delete post tags.');
            }
          });
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.postService.deletePost(postId).subscribe(() => {
            this.loadData();
          });
        } else {
          console.error('Failed to fetch tags:', err);
          alert('An error occurred while checking tags before deletion.');
        }
      }
    });
  }

  startEditingPost(post: Post) {
    this.editingPostId = post.postId!;
    this.updatedTitle = post.title;
    this.updatedText = post.text;
    this.updatedPicture = post.picture || '';
    this.updatedStatus = post.status || 'JUST_POSTED';
  }

  cancelEditing() {
    this.editingPostId = null;
  }

  applyPostChanges() {
    if (!this.editingPostId) return;

    const updatedPost: Partial<Post> = {
      title: this.updatedTitle,
      text: this.updatedText,
      picture: this.updatedPicture,
      status: this.updatedStatus
    };

    this.postService.updatePost(this.editingPostId, updatedPost as Post).subscribe({
      next: () => {
        this.loadData();
        this.editingPostId = null;
      },
      error: (err) => {
        console.error('Failed to update post:', err);
        alert('Error updating post.');
      }
    });
  }

  startCreatingPost() {
    this.creatingPost = true;
    this.selectedUserId = null;
    this.newPostTitle = '';
    this.newPostText = '';
    this.newPostPicture = '';
    this.createdPostId = null;
    this.selectedTagIds = [];
  }

  createPost() {
    if (!this.selectedUserId) {
      alert('Please select a user.');
      return;
    }

    const newPost: Post = {
      title: this.newPostTitle,
      text: this.newPostText,
      picture: this.newPostPicture,
      status: 'JUST_POSTED',
      author: { userId: this.selectedUserId } as User
    };

    this.postService.createPost(this.selectedUserId, newPost).subscribe({
      next: (createdPost) => {
        this.createdPostId = createdPost.postId!;
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to create post:', err);
        alert('Error creating post.');
      }
    });
  }

  toggleTagSelection(tagId: number) {
    if (this.selectedTagIds.includes(tagId)) {
      this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
    } else {
      this.selectedTagIds.push(tagId);
    }
  }

  addTagsToPost() {
    if (!this.createdPostId) return;

    const addTagObservables = this.selectedTagIds.map(tagId =>
      this.postHasTagService.addTagToPost(this.createdPostId!, tagId)
    );

    forkJoin(addTagObservables).subscribe({
      next: () => {
        this.loadData();
        this.creatingPost = false;
        alert('Tags added successfully.');
      },
      error: (err) => {
        console.error('Failed to add tags:', err);
        alert('Error adding tags.');
      }
    });
  }

  startCreatingTag() {
    this.creatingTag = true;
    this.newTagName = '';
  }

  createTag() {
    if (!this.newTagName.trim()) {
      alert('Please enter a tag name.');
      return;
    }

    const newTag: Partial<Tag> = { name: this.newTagName };

    this.tagService.createTag(newTag as Tag).subscribe({
      next: () => {
        this.loadData();
        this.creatingTag = false;
      },
      error: (err) => {
        console.error('Failed to create tag:', err);
        alert('Error creating tag.');
      }
    });
  }
}
