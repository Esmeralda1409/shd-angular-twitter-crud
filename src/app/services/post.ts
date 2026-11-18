import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Post as PostModel } from '../models/post.model';

@Service()
export class Post {
  private http = inject(HttpClient);
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  readonly posts = signal<PostModel[]>([]);
  readonly loading = signal<boolean>(false);

  loadPosts() {
    this.loading.set(true);
    return this.http.get<PostModel[]>(this.apiUrl).pipe(
      tap({
        next: (data) => {
          this.posts.set(data.slice(0, 15));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  createPost(newPost: PostModel) {
    return this.http.post<PostModel>(this.apiUrl, newPost).pipe(
      tap((created) => {
        created.id = Date.now();
        this.posts.update((list) => [created, ...list]);
      })
    );
  }

  updatePost(id: number, updatedPost: PostModel) {
    return this.http.put<PostModel>(`${this.apiUrl}/${id}`, updatedPost).pipe(
      tap((res) => {
        this.posts.update((list) =>
          list.map((p) => (p.id === id ? res : p))
        );
      })
    );
  }

  // Para editar posts creados localmente (id > 100) sin que JSONPlaceholder dé error 500
  updateLocalPost(updatedPost: PostModel) {
    this.posts.update((list) =>
      list.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  }

  deletePost(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.posts.update((list) => list.filter((p) => p.id !== id));
      })
    );
  }
}