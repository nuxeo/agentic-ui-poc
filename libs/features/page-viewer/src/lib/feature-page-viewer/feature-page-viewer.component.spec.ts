import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturePageViewerComponent } from './feature-page-viewer.component';

describe('FeaturePageViewerComponent', () => {
  let component: FeaturePageViewerComponent;
  let fixture: ComponentFixture<FeaturePageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturePageViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturePageViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
