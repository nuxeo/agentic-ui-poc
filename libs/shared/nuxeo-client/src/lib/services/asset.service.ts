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
      sortBy,
      sortOrder,
    } = params;

    let httpParams = new HttpParams()
      .set('currentPageIndex', pageIndex)
      .set('offset', pageIndex * pageSize)
      .set('pageSize', pageSize);

    const addAggParam = (key: string, values: string[]) => {
      if (values.length > 0) {
        httpParams = httpParams.set(key, JSON.stringify(values));
      }
    };

    addAggParam('system_primaryType_agg', primaryTypes);
    addAggParam('system_mimetype_agg', mimeTypes);
    addAggParam('asset_width_agg', widths);
    addAggParam('asset_height_agg', heights);
    addAggParam('color_profile_agg', colorProfiles);
    addAggParam('color_depth_agg', colorDepths);
    addAggParam('video_duration_agg', videoDurations);

    if (sortBy) {
      httpParams = httpParams.set('sortBy', sortBy);
    }

    if (sortOrder) {
      httpParams = httpParams.set('sortOrder', sortOrder);
    }

    return this.api.get<AssetSearchResult>(
      '/nuxeo/api/v1/search/pp/assets_search/execute',
      httpParams,
      { properties: '*' },
    );
  }
}
