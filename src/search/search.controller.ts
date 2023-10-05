import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/decorator/transform.decorator';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/search')
  @UseInterceptors(TransformInterceptor)
  async searchPosts(@Query() query): Promise<any> {
    const { s } = query;
    return this.searchService.search(s);
  }

  @Get('/autoComplete')
  @UseInterceptors(TransformInterceptor)
  async searchAutoComplete(@Query() query): Promise<any> {
    const { s } = query;
    return this.searchService.searchAutoComplete(s);
  }
}
