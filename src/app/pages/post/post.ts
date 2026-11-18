import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post as PostModel } from '../../models/post.model';
import { Post as PostService } from '../../services/post';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-post',
  imports: [FormsModule],
  templateUrl: './post.html',
  styleUrl: './post.css'
})
export class Post implements OnInit {
  protected postService = inject(PostService);
  protected auth = inject(Auth);
  private router = inject(Router);

  newPost: PostModel = { title: '', body: '', userId: 1 };
  editingPost = signal<PostModel | null>(null);

  ngOnInit(): void {
    this.postService.loadPosts().subscribe();
  }

  createPost(): void {
    if (!this.newPost.title.trim() || !this.newPost.body.trim()) return;

    this.postService.createPost(this.newPost).subscribe({
      next: () => {
        this.newPost = { title: '', body: '', userId: 1 };
      }
    });
  }

  startEdit(post: PostModel): void {
    this.editingPost.set({ ...post });
  }

  cancelEdit(): void {
    this.editingPost.set(null);
  }

  saveEdit(): void {
    const current = this.editingPost();
    if (!current || !current.id) return;

    if (current.id > 100) {
      this.postService.updateLocalPost(current);
      this.editingPost.set(null);
      return;
    }

    this.postService.updatePost(current.id, current).subscribe({
      next: () => this.editingPost.set(null)
    });
  }

  deletePost(id?: number): void {
    if (!id) return;
    this.postService.deletePost(id).subscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}