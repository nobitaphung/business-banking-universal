import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TemplateRegistry } from '@backbase/foundation-ang/core';
import { IdentityAuthModule } from '@backbase/identity-auth';
import { TransactionSigningModule } from '@backbase/identity-auth/transaction-signing';
import { AuthModule } from '@backbase/shared/feature/auth';
import { SharedAppCoreModule } from '@backbase/shared/util/app-core';
import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { RoutableModalModule } from './routable-modal/routable-modal.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterTestingModule,
        TransactionSigningModule.withConfig({
          useRedirectFlow: false,
        }),
        HttpClientTestingModule,
        RoutableModalModule,
        IdentityAuthModule,
        AuthModule,
        SharedAppCoreModule.forRoot(environment),
      ],
      providers: [
        TemplateRegistry,
        {
          provide: AuthConfig,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
