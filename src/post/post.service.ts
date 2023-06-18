import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, map, catchError, concatMap } from 'rxjs';

@Injectable()
export class PostService {
  constructor(private readonly httpService: HttpService) {}

  createPost(id: any, req: any): Observable<AxiosResponse<any>> {
    req.author = id;
    return this.httpService.post(`/wp-json/wp/v2/posts`, req).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  deletePostById(id: any, authorId: any): Observable<any> {
    return this.getPostById(id).pipe(
      concatMap((res: any) => {
        if (res?.author && res.author == authorId) {
          return this.httpService.delete(`/wp-json/wp/v2/posts/${id}`).pipe(
            map((axiosResponse: AxiosResponse) => {
              return axiosResponse.data;
            }),
            catchError((e) => {
              throw new HttpException(e.response.data, e.response.status);
            }),
          );
        }
        throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
      }),
    );
  }

  updatePostById(id: any, authorId: any, body: any): Observable<any> {
    return this.getPostById(id).pipe(
      concatMap((res: any) => {
        if (res?.author && res.author == authorId) {
          return this.httpService.put(`/wp-json/wp/v2/posts/${id}`, body).pipe(
            map((axiosResponse: AxiosResponse) => {
              return axiosResponse.data;
            }),
            catchError((e) => {
              throw new HttpException(e.response.data, e.response.status);
            }),
          );
        }
        throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
      }),
    );
  }

  getPostById(id: any): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/posts/${id}?_embed`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  posts(): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/posts?_embed`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  userPosts(id: any): Observable<AxiosResponse<any>> {
    return this.httpService
      .get(`/wp-json/wp/v2/posts?_embed&author=${id}`)
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          return axiosResponse.data;
        }),
        catchError((e) => {
          throw new HttpException(e.response.data, e.response.status);
        }),
      );
  }
}
