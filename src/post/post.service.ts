import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Observable, map, catchError, concatMap, from } from 'rxjs';
import { GetStreamService } from 'src/getstream/getstream.service';
import appConfig from 'src/config/app.config';
import { AppConfig } from 'src/config/config.type';
import {
  APIResponse,
  Activity,
  DefaultGenerics,
  FeedAPIResponse,
  FollowStatsAPIResponse,
  GetFollowAPIResponse,
  ReactionFilterAPIResponse,
} from 'getstream';
import { IndexType, SearchService } from 'src/search/search.service';

@Injectable()
export class PostService {
  constructor(
    private readonly httpService: HttpService,
    private readonly getStreamService: GetStreamService,
    readonly esService: SearchService,
  ) {}

  createPostWp(id: any, req: any): Observable<AxiosResponse<any>> {
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

  deletePostByIdWp(id: any, authorId: any): Observable<any> {
    return this.getPostByIdWp(id).pipe(
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

  updatePostByIdWp(id: any, authorId: any, body: any): Observable<any> {
    return this.getPostByIdWp(id).pipe(
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

  getPostByIdWp(id: any): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/posts/${id}?_embed`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  postsWp(): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/posts?_embed`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  userPostsWp(id: any): Observable<AxiosResponse<any>> {
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

  async posts(idLt = '', limit = 10): Promise<any> {
    const global = this.getStreamService.getClient().feed('flat', 'global');
    return from(
      global.get({
        limit: limit,
        id_lt: idLt,
        withReactionCounts: true,
        withRecentReactions: true,
        withOwnReactions: true,
      }),
    ).pipe(
      map((res: FeedAPIResponse<DefaultGenerics>) => {
        return res.results;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async createImagePost(
    file: Express.Multer.File,
    user: DecodedIdToken,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });
    const headers = {
      ...formData.getHeaders(),
      'Content-Length': formData.getLengthSync(),
      Authorization: user.getStreamToken,
    };
    return this.httpService
      .post(
        `${
          (appConfig() as AppConfig).getStreamAppUrl
        }/api/v1.0/images/?api_key=${
          (appConfig() as AppConfig).getStreamApiKey
        }`,
        formData,
        { headers },
      )
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          return axiosResponse.data;
        }),
        catchError((e) => {
          throw new HttpException(e.response.data, e.response.status);
        }),
      );
  }

  async deleteImage() {
    return from(
      this.getStreamService
        .getClient()
        .images.delete(
          'https://singapore.stream-io-cdn.com/1254992/images/c0572875-47cd-4b2f-b82c-2559ef4a60cb.fn-2019-09-26-10-24-12-0.jpg?Key-Pair-Id=APKAIHG36VEWPDULE23Q&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9zaW5nYXBvcmUuc3RyZWFtLWlvLWNkbi5jb20vMTI1NDk5Mi9pbWFnZXMvYzA1NzI4NzUtNDdjZC00YjJmLWI4MmMtMjU1OWVmNGE2MGNiLmZuLTIwMTktMDktMjYtMTAtMjQtMTItMC5qcGc~Km9oPTk2MCpvdz05NjAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjk3ODczODczfX19XX0_&Signature=RvOK~98YHH1a5A5jtc7U3oZinkzS8TIeprcX8YFEh~-SpTuqxh6ec8kmG3jPIcBX3wkbDuL9QGsGqdUgKJFmmesD4Cnb5vy-rjDsbHjClN56rYYMQKHeHkD5QzT4aSNLRxc5jtiCJ9rw8US8T9EB8wxsg5H3Y~doEJFGIHKTt7EMWBtxYNNPJ-ylaiwwgNuQrqL8E~iitQoj0p3v-los1b749rKf~neOeG-pFJjmC0VjoApJalnkbkqSxciOTHnr1uJfzPpvSz~AvW8JfcvgUUiSgtoXmLHVPCR8b0r0~QEnBPGkqAgkjRbLLvdibiebOXJ6g0SPVJKyNaQLGJoZBA__&oh=960&ow=960',
        ),
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async createPosts(id: string, req: any): Promise<any> {
    const user = this.getStreamService.getClient().user(id);
    const global = this.getStreamService.getClient().feed('user', id);
    return from(
      global.addActivity({
        actor: user,
        verb: 'add',
        foreign_id: id,
        to: ['flat:global'],
        ...req,
      }),
    ).pipe(
      map((res: Activity<DefaultGenerics>) => {
        this.esService.createIndex(res, IndexType.ACTIVITY);
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async likePost(id: string, user: DecodedIdToken): Promise<any> {
    return from(
      this.getStreamService.getClient().reactions.filter({
        activity_id: id,
        kind: 'like',
      }),
    ).pipe(
      concatMap((res: ReactionFilterAPIResponse<DefaultGenerics>) => {
        const foundIndex = res.results.findIndex((v) => v.user_id == user.uid);
        if (foundIndex >= 0) {
          const myLike = res.results[foundIndex];
          return from(
            this.getStreamService.getClient().reactions.delete(myLike.id),
          ).pipe(
            map((res: any) => {
              return res;
            }),
            catchError((e) => {
              throw new HttpException(e.response.data, e.response.status);
            }),
          );
        }
        return from(
          this.getStreamService
            .getClient()
            .reactions.add('like', id, {}, { userId: user.uid }),
        ).pipe(
          map((res: any) => {
            return res;
          }),
          catchError((e) => {
            throw new HttpException(e.response.data, e.response.status);
          }),
        );
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async getCommentPost(id: string): Promise<any> {
    return from(
      this.getStreamService.getClient().reactions.filter({
        activity_id: id,
        kind: 'comment',
        limit: 1000,
      }),
    ).pipe(
      map((res: ReactionFilterAPIResponse<DefaultGenerics>) => {
        return res.results;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async getLikePost(id: string): Promise<any> {
    return from(
      this.getStreamService.getClient().reactions.filter({
        activity_id: id,
        kind: 'like',
        limit: 1000,
      }),
    ).pipe(
      map((res: ReactionFilterAPIResponse<DefaultGenerics>) => {
        return res.results;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async commentPost(id: string, userId: string, body: any): Promise<any> {
    return from(
      this.getStreamService.getClient().reactions.add('comment', id, body, {
        userId,
      }),
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async deletePostById(id: string, userId: string): Promise<any> {
    return from(
      this.getStreamService
        .getClient()
        .feed('user', id)
        .removeActivity({ foreign_id: userId }),
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async userPosts(id: string, idLt = '', limit = 10): Promise<any> {
    const global = this.getStreamService.getClient().feed('user', id);
    return from(
      global.get({
        limit: limit,
        id_lt: idLt,
        withReactionCounts: true,
        withRecentReactions: true,
        withOwnReactions: true,
      }),
    ).pipe(
      map((res: FeedAPIResponse<DefaultGenerics>) => {
        return res.results;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async followingPosts(id: string): Promise<any> {
    const global = this.getStreamService.getClient().feed('timeline', id);
    return from(
      global.get({
        limit: 10,
        withReactionCounts: true,
        withRecentReactions: true,
        withOwnReactions: true,
      }),
    ).pipe(
      map((res: FeedAPIResponse<DefaultGenerics>) => {
        return res.results;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async userFollowerFeed(id: string): Promise<any> {
    const global = this.getStreamService.getClient().feed('user', id);
    return from(
      global.followers({
        limit: 10,
      }),
    ).pipe(
      map((res: GetFollowAPIResponse) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async userFollowingFeed(id: string): Promise<any> {
    const global = this.getStreamService.getClient().feed('timeline', id);
    return from(
      global.following({
        limit: 10,
      }),
    ).pipe(
      map((res: GetFollowAPIResponse) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async follow(userID: string, targetUserId: string): Promise<any> {
    const feed = this.getStreamService.getClient().feed('timeline', userID);
    return from(feed.follow('user', targetUserId)).pipe(
      map((res: APIResponse) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async unFollow(userID: string, targetUserId: string): Promise<any> {
    const feed = this.getStreamService.getClient().feed('timeline', userID);
    return from(feed.unfollow('user', targetUserId)).pipe(
      map((res: APIResponse) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async sharePost(activityId: string, body: any, userId: string): Promise<any> {
    return from(
      this.getStreamService
        .getClient()
        .reactions.add('share', activityId, body, {
          userId,
          targetFeeds: [`timeline:${userId}`, `flat:global`],
        }),
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }
}
