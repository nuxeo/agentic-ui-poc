import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AdministrationShellComponent } from './administration-shell.component';

describe('AdministrationShellComponent', () => {
  let component: AdministrationShellComponent;
  let fixture: ComponentFixture<AdministrationShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrationShellComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrationShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('should have the correct CSS class on the main section', () => {
    const section = fixture.debugElement.query(By.css('section'));
    expect(section).toBeTruthy();
    expect(section.nativeElement.classList.contains('admin-shell__main')).toBe(true);
  });
});
