import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureDashboardTilesComponent } from './feature-dashboard-tiles.component';

describe('FeatureDashboardTilesComponent', () => {
  let component: FeatureDashboardTilesComponent;
  let fixture: ComponentFixture<FeatureDashboardTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureDashboardTilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureDashboardTilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
