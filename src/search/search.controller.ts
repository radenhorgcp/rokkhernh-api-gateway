import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransformInterceptor } from 'src/decorator/transform.decorator';
import { SearchService } from './search.service';
import { FirebaseGuard } from 'src/auth/firebase.guard';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/search')
  @UseInterceptors(TransformInterceptor)
  async searchPosts(@Query() query): Promise<any> {
    const { s } = query;
    return this.searchService.search(s);
  }

  @Get('/forwardGeocoding')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async forwardGeocoding(@Query() query): Promise<any> {
    const { q } = query;
    return this.searchService.forwardGeocoding(q);
  }

  @Get('/autoComplete')
  @UseInterceptors(TransformInterceptor)
  async searchAutoComplete(@Query() query): Promise<any> {
    const { s } = query;
    return this.searchService.searchAutoComplete(s);
  }
}
