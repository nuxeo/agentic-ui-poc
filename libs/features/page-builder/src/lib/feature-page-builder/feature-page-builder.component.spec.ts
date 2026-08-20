import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturePageBuilderComponent } from './feature-page-builder.component';

describe('FeaturePageBuilderComponent', () => {
  let component: FeaturePageBuilderComponent;
  let fixture: ComponentFixture<FeaturePageBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturePageBuilderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturePageBuilderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
