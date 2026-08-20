import { TrashComponent } from './trash/trash.component';
import { trashRoutes } from './lib.routes';

describe('trashRoutes', () => {
  it('exposes the trash page at the lazy-loaded root path', () => {
    expect(trashRoutes).toEqual([{ path: '', component: TrashComponent }]);
  });
});
