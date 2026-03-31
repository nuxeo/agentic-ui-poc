import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AssetSearchParams, AssetSearchResult } from '../models/asset.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly api = inject(NuxeoApiBase);

  searchAssets(params: AssetSearchParams = {}): Observable<AssetSearchResult> {
    const {
      pageIndex = 0,
      pageSize = 40,
      primaryTypes = [],
      mimeTypes = [],
      widths = [],
      heights = [],
      colorProfiles = [],
      colorDepths = [],
      videoDurations = [],
    } = params;

    const httpParams = new HttpParams()
      .set('currentPageIndex', pageIndex)
      .set('offset', pageIndex * pageSize)
      .set('pageSize', pageSize)
      .set('system_primaryType_agg', JSON.stringify(primaryTypes))
      .set('system_mimetype_agg', JSON.stringify(mimeTypes))
      .set('asset_width_agg', JSON.stringify(widths))
      .set('asset_height_agg', JSON.stringify(heights))
      .set('color_profile_agg', JSON.stringify(colorProfiles))
      .set('color_depth_agg', JSON.stringify(colorDepths))
      .set('video_duration_agg', JSON.stringify(videoDurations));

    return this.api.get<AssetSearchResult>(
      '/nuxeo/api/v1/search/pp/assets_search/execute',
      httpParams,
      { properties: 'dublincore,file' },
    );
  }
}
