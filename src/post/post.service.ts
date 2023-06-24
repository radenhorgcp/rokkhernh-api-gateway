import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, map, catchError, concatMap } from 'rxjs';
import { GetStreamService } from 'src/getstream/getstream.service';

@Injectable()
export class PostService {
  constructor(
    private readonly httpService: HttpService,
    private readonly getStreamService: GetStreamService,
  ) {}

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

  async postsV2(): Promise<any> {
    const bob007 = this.getStreamService.getClient().feed('user', 'bob007');
    const results = await bob007.get({ limit: 10 });
    return results;
  }

  async createPostsV2(): Promise<any> {
    const bob007 = this.getStreamService.getClient().feed('user', 'bob007');
    const results = await bob007.addActivity({
      actor: 'bob007',
      verb: 'add',
      object: 'picture:10',
      foreign_id: 'picture:10',
      message: 'Beautiful bird!9999',
      image:
        'https://singapore.stream-io-cdn.com/1254992/images/8e5bea91-9776-428b-bc62-cdb6a160641e.test.png?Key-Pair-Id=APKAIHG36VEWPDULE23Q&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9zaW5nYXBvcmUuc3RyZWFtLWlvLWNkbi5jb20vMTI1NDk5Mi9pbWFnZXMvOGU1YmVhOTEtOTc3Ni00MjhiLWJjNjItY2RiNmExNjA2NDFlLnRlc3QucG5nPypvaD0xMjYqb3c9MjY2KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY4ODY5MDk4M319fV19&Signature=mBcJGBoGi5IHKw5yfcBoDLJ3gwxjP-nj919QCheyZr-m2GD4VhrU~QsDznHlNQQyhbVDL6MYjicEoEP~wgE-jn2jnKF5MAX-mVG1w5FhjHIt23ul3innU~2lji3P9gHFGMlIwbbNVa6ZD8tt5lYwHZJxa8kNnkO5kt-OnC53o-Xlz-o6kVUiV~HyLhBY7pQIiqzawcA6aZiI~GJAtdIGrEh5adLV-HRMW8qQg0eVAZf4hAr8kBfjMzd85OkY2Htypa-9ABd1-3O~32YhvRRQVDZkFvIBsYHpzG6KWZ4WmYdShf-vKgqqRFFfiIB908Ff5Ihuq016mYb-7LHtc3ZsHw__&oh=126&ow=266',
    });
    return results;
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
