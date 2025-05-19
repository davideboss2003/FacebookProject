import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService, Post } from '../service/post.service';
import { TagService, Tag } from '../service/tag.service';
import { PostHasTagService } from '../service/posthastag.service';
import { UserService, User } from '../service/user.service';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { CommentService, Comment as AppComment } from '../service/comment.service';
import { VoteForCommentService } from '../service/voteforcomment.service';
import { VoteForPostService, VoteType} from '../service/voteforpost.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  tags: Tag[] = [];
  users: User[] = [];
  postTagsMap: { [postId: number]: Tag[] } = {};

  creatingPost = false;
  creatingTag = false;
  newPostTitle: string = '';
  newPostText: string = '';
  newPostPicture: string = '';
  newTagName: string = '';
  createdPostId: number | null = null;
  selectedTagIds: number[] = [];

  currentUser: User | null = null;

  // Filter
  filterMode: string = '';
  selectedFilterTagId: number | null = null;
  selectedFilterUserId: number | null = null;
  titleSearchText: string = '';

  //update
  editingPostId: number | null = null;
  updatedTitle: string = '';
  updatedText: string = '';
  updatedPicture: string = '';
  updatedStatus: 'JUST_POSTED' | 'FIRST_REACTIONS' | 'OUTDATED' = 'JUST_POSTED';

  //comments
  postCommentsMap: { [postId: number]: AppComment[] } = {};

  commentingPostId: number | null = null;
  newCommentText: string = '';
  newCommentPicture: string = '';

  //updateComment
  editingCommentId: number | null = null;
  updatedCommentText: string = '';
  updatedCommentPicture: string = '';

  //votePosts
  votedPosts: { [postId: number]: VoteType } = {};

  //voteCounts
  voteCounts: { [postId: number]: number } = {};

  //voteComments
  votedComments: { [commentId: number]: VoteType } = {};

  //voteCountsForComments
  voteCountsForComments: { [commentId: number]: number } = {};

  //userscores
  userScores: { [userId: number]: number } = {};

  //for ban
  isAdmin = false;
  showBanSection = false;
  showUnbanSection = false;

  notBannedUsers: User[] = [];
  bannedUsers: User[] = [];

  selectedUserToBan: number | null = null;
  selectedUserToUnban: number | null = null;


  constructor(
    private postService: PostService,
    private tagService: TagService,
    private postHasTagService: PostHasTagService,
    private userService: UserService,
    private commentService: CommentService,
    private voteForCommentService: VoteForCommentService,
    private voteForPostService: VoteForPostService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if(this.currentUser?.isAdmin){
      this.isAdmin = true;
      this.fetchUsers();
    }

    localStorage.clear();

    this.loadData();
  }

  fetchUsers(): void{
    this.userService.getAllUsers().subscribe(users => {
      this.notBannedUsers = users.filter((u: User) => !u.isBanned);
      this.bannedUsers = users.filter((u: User) => u.isBanned);
    });
  }

  loadData() {

    this.fetchUsers();

    this.postService.getAllPosts().subscribe(posts => {
      this.posts = posts.sort((a, b) => {
        const dateA = new Date(a.creationDateTime ?? 0).getTime();
        const dateB = new Date(b.creationDateTime ?? 0).getTime();
        return dateB - dateA;
      });
      this.filteredPosts = [...this.posts];

      const userIds = new Set<number>();

      this.posts.forEach(post => {
        if (post.author?.userId) {
          userIds.add(post.author.userId);
        }

        this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            comments.forEach(comment => {
              if (comment.user?.userId) {
                userIds.add(comment.user.userId);
              }
            });

        // after collecting all userIds, fetch scores
          userIds.forEach(userId => {
            if (!(userId in this.userScores)) {
              this.userService.getUserScore(userId).subscribe(score => {
                this.userScores[userId] = score;
              });
            }
          });
        });
    });


      this.posts.forEach((post) => {
        this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            // Fetch vote counts asynchronously and sort after all are retrieved
            forkJoin([
              ...comments.map(comment => 
                this.voteForCommentService.getVoteCountForComment(comment.commentId!)
              )
            ]).subscribe(voteCounts => {
              const commentVotes = comments.map((comment, idx) => ({
                comment,
                voteCount: voteCounts[idx]
              }));
              commentVotes.sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
              this.postCommentsMap[post.postId!] = commentVotes.map(cv => cv.comment);
            });
        });
      });

      this.posts.forEach(post => {
        this.voteForPostService.getVoteCountForPost(post.postId!).subscribe((count) => {
        this.voteCounts[post.postId!] = count;
        });
      });


      if (this.currentUser) {
      posts.forEach((post) => {
        if (post.author.userId !== this.currentUser?.userId) {
          this.voteForPostService.getUserVoteType(post.postId!, this.currentUser?.userId!).subscribe((voteType) => {
            if (voteType) {
              this.votedPosts[post.postId!] = voteType;
            }
          });
        }
      });
    }

    if (this.currentUser) {
      posts.forEach((post) => {
        this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            comments.forEach(comment => {
              if(comment.user.userId !== this.currentUser?.userId) {
                this.voteForCommentService.getUserVoteType(comment.commentId!, this.currentUser?.userId!).subscribe((voteType) => {
                  if (voteType) {
                    this.votedComments[comment.commentId!] = voteType;
                  }
                });
              }
            });
          });
      });
    };

    this.posts.forEach(post => {
          this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            comments.forEach(comment => {
              this.voteForCommentService.getVoteCountForComment(comment.commentId!).subscribe((count) => {
                this.voteCountsForComments[comment.commentId!] = count;
              });
            });
          });
        });

      this.posts.forEach(post => {
        this.loadTagsForPost(post.postId!);
        this.loadCommentsForPost(post.postId!);
        this.checkUserVote(post.postId!);

        this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            comments.forEach(comment => {
              this.checkUserVoteForComment(comment.commentId!);
            });
          });

      });
        
    });

    this.tagService.getAllTags().subscribe(tags => (this.tags = tags));
    this.userService.getAllUsers().subscribe(users => (this.users = users));
  }

  //for ban

  banUser(): void {
    if (this.selectedUserToBan != null) {
      this.userService.banUser(this.selectedUserToBan).subscribe(() => {
        alert('User has been banned');
        this.fetchUsers();
        this.selectedUserToBan = null;
        this.showBanSection = false;
      });
    }
  }

  unbanUser(): void {
    if (this.selectedUserToUnban != null) {
      this.userService.unbanUser(this.selectedUserToUnban).subscribe(() => {
        alert('User has been unbanned');
        this.fetchUsers();
        this.selectedUserToUnban = null;
        this.showUnbanSection = false;
      });
    }
  }

  loadTagsForPost(postId: number) {
    this.postHasTagService.getTagsForPost(postId).subscribe(postTags => {
      this.postTagsMap[postId] = postTags.map(pt => pt.tag);
    });
  }

  getPostTags(postId: number): Tag[] {
    return this.postTagsMap[postId] || [];
  }

  loadCommentsForPost(postId: number) {
    this.commentService.getCommentsForPost(postId).subscribe(comments => {
      this.postCommentsMap[postId] = comments;
    });
  }
  

  getPostComments(postId: number): AppComment[] {
    return this.postCommentsMap[postId] || [];
  }

  startCommenting(postId: number): void {
    this.commentingPostId = postId;
    this.newCommentText = '';
    this.newCommentPicture = '';
  }
  
  cancelCommenting(): void {
    this.commentingPostId = null;
  }
  
  postComment(postId: number): void {
    console.log("Posting comment for postId:", postId);
    console.log("Posting comment with userId:", this.currentUser?.userId);
    //const userJson = localStorage.getItem('user');
    //if (!userJson) return;
  
    //const user = JSON.parse(userJson);
    //const userId = user.userId;
  
    const newComment = {
      text: this.newCommentText,
      picture: this.newCommentPicture,
      user: { userId: this.currentUser?.userId } as User,
      post: { postId } as Post
    };
  
    this.commentService.addCommentToPost(postId, newComment.user.userId!, newComment).subscribe({
      next: () => {
        this.commentingPostId = null;
        alert('New comment just posted.');
        this.loadData(); // Refresh comments
      },
      error: err => {
        console.error('Error posting comment:', err);
      }
    });
  }

  // Check if the current user can delete the comment
canDeleteComment(comment: any): boolean {
  //const currentUser = JSON.parse(localStorage.getItem('user')!);
  //return currentUser && (currentUser.userId === comment.user.userId || currentUser.role === 'ADMIN');
  return (
    this.currentUser?.isAdmin === true || 
    this.currentUser?.userId === comment.user.userId
  );
}

// Delete a comment after removing its votes
deleteCommentWithVotes(commentId: number): void {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  this.voteForCommentService.getUserIdsWhoVotedOnComment(commentId).subscribe({
    next: (userIds) => {
      if (userIds.length > 0) {
        const deleteVotes = userIds.map(userId =>
          this.voteForCommentService.removeVoteFromComment(commentId, userId)
        );

        forkJoin(deleteVotes).subscribe({
          next: () => {
            this.commentService.deleteComment(commentId).subscribe({
              next: () => {
                alert('Comment deleted successfully');
                this.loadData();
              },
              error: err => console.error('Error deleting comment after removing votes:', err)
            });
          },
          error: err => console.error('Error removing votes:', err)
        });

      } else {
        // No votes, so just delete the comment directly
        this.commentService.deleteComment(commentId).subscribe({
          next: () => {
            alert('Comment deleted successfully');
            this.loadData();
          },
          error: err => console.error('Error deleting comment with no votes:', err)
        });
      }
    },
    error: err => {
      console.error('Error retrieving voters — trying to delete anyway...', err);
      // In case the call to get voters fails (e.g., 404), try deleting anyway
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          alert('Comment deleted (fallback)');
          this.loadData();
        },
        error: err => console.error('Final fallback error deleting comment:', err)
      });
    }
  });
}

canEditComment(comment: AppComment): boolean {
  return (
    this.currentUser?.isAdmin === true || 
    this.currentUser?.userId === comment.user.userId
  );
}

startEditingComment(comment: AppComment) {
  this.editingCommentId = comment.commentId!;
  this.updatedCommentText = comment.text;
  this.updatedCommentPicture = comment.picture || '';
}

cancelEditingComment() {
  this.editingCommentId = null;
}

applyCommentChanges() {
  if (!this.editingCommentId) return;

  const updatedComment: Partial<AppComment> = {
    text: this.updatedCommentText,
    picture: this.updatedCommentPicture,
  };

  this.commentService.updateComment(this.editingCommentId, updatedComment as AppComment).subscribe({
    next: () => {
      this.loadData();
      this.editingCommentId = null;
    },
    error: err => {
      console.error('Failed to update comment:', err);
      alert('Error updating comment.');
    },
  });
}
   
// Check if the logged-in user already voted on this post
  checkUserVote(postId: number): void {
    // We try to get vote from server (you can optimize with a new endpoint if needed)
    this.voteForPostService.getVoteCountForPost(postId).subscribe(); // Just to show net vote count, optional

    // Basic logic to avoid voting on your own post
    // You could alternatively create a custom backend method to check if user voted and what type
    // but for now, you can simulate it client-side after voting
    // So by default: votedPosts[] is empty until user votes
  }

  vote(postId: number, voteType: VoteType): void {
    this.voteForPostService.addVoteToPost(postId, this.currentUser?.userId!, voteType).subscribe({
      next: (vote) => {
        this.votedPosts[postId] = voteType;
            this.posts.forEach(post => {
              this.voteForPostService.getVoteCountForPost(post.postId!).subscribe((count) => {
              this.voteCounts[post.postId!] = count;
              });
            });


    const post = this.posts.find(p => p.postId === postId);
    const authorId = post?.author?.userId;
    if (authorId != null) {
      this.userService.getUserScore(authorId).subscribe(score => {
        this.userScores[authorId] = score;
      });
    }

      },
      error: (err) => {
        console.error('Vote failed', err);
        alert(err.error.message || 'Voting failed.');
      },
    });
  }

  // Utility
  hasUserVoted(postId: number): boolean {
    return postId in this.votedPosts;
  }

  getVoteLabel(postId: number): string {
    const vote = this.votedPosts[postId];
    return vote === 'UPVOTE' ? 'UPVOTED' : 'DOWNVOTED';
  }
  
  checkUserVoteForComment(commentId: number): void {
    this.voteForCommentService.getVoteCountForComment(commentId).subscribe(); // Just to show net vote count, optional
  }

  voteComment(commentId: number, voteType: VoteType): void {
    this.voteForCommentService.addVoteToComment(commentId, this.currentUser?.userId!, voteType).subscribe({
      next: (vote) => {
        this.votedComments[commentId] = voteType;
        this.posts.forEach(post => {
          this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            comments.forEach(comment => {
              this.voteForCommentService.getVoteCountForComment(comment.commentId!).subscribe((count) => {
                this.voteCountsForComments[comment.commentId!] = count;
              });
            });
          });
        });

      this.posts.forEach((post) => {
        this.commentService.getCommentsForPost(post.postId!).subscribe(comments => {
            // Fetch vote counts asynchronously and sort after all are retrieved
            forkJoin([
              ...comments.map(comment => 
                this.voteForCommentService.getVoteCountForComment(comment.commentId!)
              )
            ]).subscribe(voteCounts => {
              const commentVotes = comments.map((comment, idx) => ({
                comment,
                voteCount: voteCounts[idx]
              }));
              commentVotes.sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
              this.postCommentsMap[post.postId!] = commentVotes.map(cv => cv.comment);
            });
        });
      });  

    for (const postId in this.postCommentsMap) {
      const comment = this.postCommentsMap[postId].find(c => c.commentId === commentId);
      if (comment) {
        const authorId = comment.user?.userId;
        if (authorId != null) {
          this.userService.getUserScore(authorId).subscribe(score => {
            this.userScores[authorId] = score;
          });
          this.userService.getUserScore(this.currentUser?.userId!).subscribe(score => {
            this.userScores[this.currentUser?.userId!] = score;
          });
        }
        break;
      }
    }

      },
      error: (err) => {
        console.error('Vote failed', err);
        alert(err.error.message || 'Voting failed.');
      },
    });
  }

  hasUserVotedComment(commentId: number): boolean {
    return commentId in this.votedComments;
  }

  getVoteLabelForComment(commentId: number): string {
    const vote = this.votedComments[commentId];
    return vote === 'UPVOTE' ? 'UPVOTED' : 'DOWNVOTED';
  }

  startCreatingPost() {
    this.creatingPost = true;
    this.newPostTitle = '';
    this.newPostText = '';
    this.newPostPicture = '';
    this.createdPostId = null;
    this.selectedTagIds = [];
  }

  createPost() {
    if (!this.currentUser?.userId) {
      alert('Please select a user.');
      return;
    }

    const newPost: Partial<Post> = {
      title: this.newPostTitle,
      text: this.newPostText,
      picture: this.newPostPicture,
      status: 'JUST_POSTED',
    };

    this.postService.createPost(this.currentUser.userId, newPost as Post).subscribe({
      next: createdPost => {
        this.createdPostId = createdPost.postId!;
        alert('Info for post successfully saved.');
      },
      error: err => {
        console.error('Failed to create post:', err);
        alert('Error creating post.');
      },
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
        this.createdPostId = null;
        alert('Tags added successfully.');
      },
      error: err => {
        console.error('Failed to add tags:', err);
        alert('Error adding tags.');
      },
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
        this.tagService.getAllTags().subscribe(tags => {
          this.tags = tags;
        });
        this.creatingTag = false;
      },
      error: err => {
        console.error('Failed to create tag:', err);
        alert('Error creating tag.');
      },
    });
  }

  applyFilter() {
    switch (this.filterMode) {
      case 'tag':
        const tagId = Number(this.selectedFilterTagId);
        this.filteredPosts = this.posts.filter(post =>
          this.getPostTags(post.postId!).some(tag => tag.tagId === tagId)
        );
        break;
      case 'user':
        const userId = Number(this.selectedFilterUserId);
        this.filteredPosts = this.posts.filter(post => post.author.userId === userId);
        break;
      case 'mine':
        this.filteredPosts = this.posts.filter(post => post.author.userId === this.currentUser?.userId);
        break;
      case 'title':
        const query = this.titleSearchText.trim().toLowerCase();
        this.filteredPosts = this.posts.filter(post => post.title.toLowerCase().includes(query));
        break;
      default:
        this.filteredPosts = [...this.posts];
    }
  }

  clearFilter() {
    this.filterMode = '';
    this.filteredPosts = [...this.posts];
  }

  canEdit(post: Post): boolean {
    //const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return (
      this.currentUser?.isAdmin === true || 
      this.currentUser?.userId === post.author.userId
    );
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

  // --- ADDED for delete ---
  canDelete(post: Post): boolean {
    return (
      this.currentUser?.isAdmin === true ||
      this.currentUser?.userId === post.author.userId
    );
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;
  
    this.postHasTagService.getTagsForPost(postId).subscribe({
      next: (tags) => {
        const tagRemovalObservables = tags.map(tag =>
          this.postHasTagService.removeTagFromPost(postId, tag.tag.tagId!)
        );
  
        this.commentService.getCommentsForPost(postId).subscribe({
          next: (comments) => {
            if (comments.length === 0) {
              forkJoin(tagRemovalObservables.length ? tagRemovalObservables : [of(null)]).subscribe({
                next: () => {
                  this.voteForPostService.removeAllVotesFromPost(postId).subscribe({
                    next: () => {
                      this.postService.deletePost(postId).subscribe(() => {
                        this.loadData();
                        alert('Post deleted successfully.');
                      });
                    },
                    error: (err) => {
                      console.error('Failed to remove post votes:', err);
                      alert('An error occurred while removing post votes.');
                    }
                  });
                },
                error: (err) => {
                  console.error('Failed to remove tags (no-comment case):', err);
                  alert('An error occurred while deleting tags.');
                }
              });
              return;
            }
  
            const voteRemovalObservables: Observable<any>[] = [];
            const voteFetches = comments.map(comment =>
              this.voteForCommentService.getUserIdsWhoVotedOnComment(comment.commentId!).pipe(
                tap(userIds => {
                  userIds.forEach(userId => {
                    voteRemovalObservables.push(
                      this.voteForCommentService.removeVoteFromComment(comment.commentId!, userId)
                    );
                  });
                })
              )
            );
  
            forkJoin(voteFetches).subscribe({
              next: () => {
                forkJoin(voteRemovalObservables.length ? voteRemovalObservables : [of(null)]).subscribe({
                  next: () => {
                    const commentDeletionObservables = comments.map(comment =>
                      this.commentService.deleteComment(comment.commentId!)
                    );
  
                    forkJoin([...tagRemovalObservables, ...commentDeletionObservables]).subscribe({
                      next: () => {
                        this.voteForPostService.removeAllVotesFromPost(postId).subscribe({
                          next: () => {
                            this.postService.deletePost(postId).subscribe(() => {
                              this.loadData();
                              alert('Post deleted successfully.');
                            });
                          },
                          error: (err) => {
                            console.error('Failed to remove post votes:', err);
                            alert('An error occurred while removing post votes.');
                          }
                        });
                      },
                      error: (err) => {
                        console.error('Failed to remove tags or comments:', err);
                        alert('An error occurred while deleting tags/comments.');
                      }
                    });
                  },
                  error: (err) => {
                    console.error('Failed to remove votes:', err);
                    alert('An error occurred while removing votes.');
                  }
                });
              },
              error: (err) => {
                console.error('Failed to fetch voters for comments:', err);
                alert('An error occurred while checking votes before deletion.');
              }
            });
          },
          error: (err) => {
            console.error('Failed to fetch comments:', err);
            alert('An error occurred while retrieving comments before deletion.');
          }
        });
      },
      error: (err) => {
        if (err.status === 404) {
          this.commentService.getCommentsForPost(postId).subscribe({
            next: (comments) => {
              if (comments.length === 0) {
                this.voteForPostService.removeAllVotesFromPost(postId).subscribe({
                  next: () => {
                    this.postService.deletePost(postId).subscribe(() => {
                      this.loadData();
                      alert('Post deleted successfully.');
                    });
                  },
                  error: (err) => {
                    console.error('Failed to remove post votes (no-tags/comments case):', err);
                    alert('An error occurred while removing post votes.');
                  }
                });
                return;
              }
  
              const voteRemovalObservables: Observable<any>[] = [];
              const voteFetches = comments.map(comment =>
                this.voteForCommentService.getUserIdsWhoVotedOnComment(comment.commentId!).pipe(
                  tap(userIds => {
                    userIds.forEach(userId => {
                      voteRemovalObservables.push(
                        this.voteForCommentService.removeVoteFromComment(comment.commentId!, userId)
                      );
                    });
                  })
                )
              );
  
              forkJoin(voteFetches).subscribe({
                next: () => {
                  forkJoin(voteRemovalObservables.length ? voteRemovalObservables : [of(null)]).subscribe({
                    next: () => {
                      const commentDeletionObservables = comments.map(comment =>
                        this.commentService.deleteComment(comment.commentId!)
                      );
  
                      forkJoin(commentDeletionObservables).subscribe({
                        next: () => {
                          this.voteForPostService.removeAllVotesFromPost(postId).subscribe({
                            next: () => {
                              this.postService.deletePost(postId).subscribe(() => {
                                this.loadData();
                                alert('Post deleted successfully.');
                              });
                            },
                            error: (err) => {
                              console.error('Failed to remove post votes (comments only case):', err);
                              alert('An error occurred while removing post votes.');
                            }
                          });
                        },
                        error: (err) => {
                          console.error('Failed to delete comments:', err);
                          alert('An error occurred while deleting comments.');
                        }
                      });
                    },
                    error: (err) => {
                      console.error('Failed to remove votes (no-tags case):', err);
                      alert('An error occurred while removing votes.');
                    }
                  });
                },
                error: (err) => {
                  console.error('Failed to fetch voters (no-tags case):', err);
                  alert('An error occurred while checking votes before deletion.');
                }
              });
            },
            error: (error) => {
              console.error('Failed to fetch comments after tag fetch failed:', error);
              alert('An error occurred while checking comments before deletion.');
            }
          });
        } else {
          console.error('Failed to fetch tags:', err);
          alert('An error occurred while checking tags before deletion.');
        }
      }
    });
  }
}
