import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AxiosResponse } from 'axios';
import { Activity, DefaultGenerics, StreamUser } from 'getstream';
import { catchError, map } from 'rxjs';
import appConfig from 'src/config/app.config';
import { AppConfig } from 'src/config/config.type';
import { v4 as uuidv4 } from 'uuid';

export enum IndexType {
  USER,
  ACTIVITY,
}

@Injectable()
export class SearchService {
  constructor(
    private readonly esService: ElasticsearchService,
    private readonly httpService: HttpService,
  ) {}

  async createIndex(
    data: Activity<DefaultGenerics> | StreamUser<DefaultGenerics>,
    type: IndexType,
  ) {
    try {
      const checkIndex = await this.esService.indices.exists({
        index: (appConfig() as AppConfig).elasticSearchIndex,
      });
      if (!checkIndex) {
        await this.esService.indices
          .create({
            index: (appConfig() as AppConfig).elasticSearchIndex,
            settings: {
              analysis: {
                tokenizer: {
                  autocomplete: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 30,
                    token_chars: ['letter', 'digit', 'whitespace'],
                  },
                },
                analyzer: {
                  autocomplete_search_analyzer: {
                    type: 'custom',
                    filter: ['lowercase'],
                    tokenizer: 'keyword',
                  },
                  autocomplete_analyzer: {
                    type: 'custom',
                    tokenizer: 'autocomplete',
                    filter: ['lowercase'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  fields: {
                    complete: {
                      type: 'text',
                      analyzer: 'autocomplete_analyzer',
                      search_analyzer: 'autocomplete_search_analyzer',
                    },
                    suggest: {
                      type: 'completion',
                      analyzer: 'simple',
                      preserve_separators: true,
                      preserve_position_increments: true,
                      max_input_length: 50,
                    },
                  },
                },
                actor: {
                  type: 'text',
                  fields: {
                    complete: {
                      type: 'text',
                      analyzer: 'autocomplete_analyzer',
                      search_analyzer: 'autocomplete_search_analyzer',
                    },
                    suggest: {
                      type: 'completion',
                      analyzer: 'simple',
                      preserve_separators: true,
                      preserve_position_increments: true,
                      max_input_length: 50,
                    },
                  },
                },
              },
            },
          })
          .catch((err) => {
            console.error(err);
          });
        const body = await this.parseAndPrepareData(data, type);
        await this.esService
          .bulk({
            index: (appConfig() as AppConfig).elasticSearchIndex,
            body,
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        const body = await this.parseAndPrepareData(data, type);
        await this.esService
          .bulk({
            index: (appConfig() as AppConfig).elasticSearchIndex,
            body,
          })
          .catch((err) => {
            console.error(err);
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async search(search: string) {
    const results = [];
    const body = await this.esService.search({
      index: (appConfig() as AppConfig).elasticSearchIndex,
      body: {
        size: 12,
        query: {
          bool: {
            should: [
              {
                wildcard: {
                  title: `*${search}*`,
                },
              },
            ],
          },
        },
      },
    });
    const hits = body.hits.hits;
    hits.map((item) => {
      results.push(item._source);
    });

    return results;
  }

  async searchAutoComplete(search: string) {
    const results = [];
    const suggestQuery = {
      size: 10,
      query: {
        wildcard: {
          'title.complete': `${search}*`,
        },
      },
      suggest: {
        gotsuggest: {
          text: search,
          term: { field: 'title.complete' },
        },
      },
    };
    const body = await this.esService.search({
      index: (appConfig() as AppConfig).elasticSearchIndex,
      body: suggestQuery,
    });
    const hits = body.hits.hits;
    hits.map((item) => {
      results.push(item._source);
    });

    return { results, total: body.hits.total };
  }

  async parseAndPrepareData(
    data: Activity<DefaultGenerics> | StreamUser<DefaultGenerics>,
    type: IndexType,
  ) {
    const body = [];
    let obj: any = {};
    if (type === IndexType.ACTIVITY) {
      const activityData = data as Activity<DefaultGenerics>;
      obj = {
        title: activityData.message,
        actor: activityData.actor,
        id: activityData.id,
        time: activityData.time,
        obj: activityData.object,
        type,
      };
    } else {
      const userData = data as StreamUser<DefaultGenerics>;
      obj = {
        title: userData.data.fullName,
        actor: userData.data.username,
        id: uuidv4(),
        time: userData.full.created_at,
        obj: JSON.stringify(userData.data),
        type,
      };
    }
    body.push(
      {
        index: {
          _index: (appConfig() as AppConfig).elasticSearchIndex,
          _id: obj.id,
        },
      },
      obj,
    );
    return body;
  }

  async forwardGeocoding(q: string) {
    return this.httpService
      .get(
        `https://us1.locationiq.com/v1/search?q=${q}&key=pk.b28f907cfda14c35302fb395a3fe2151&format=json`,
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
}
