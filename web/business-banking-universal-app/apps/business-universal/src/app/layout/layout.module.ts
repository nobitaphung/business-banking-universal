import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BusinessLayoutModule } from '@backbase/business/feature/layout';
import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { HeaderModule } from '@backbase/ui-ang/header';
import { IconModule } from '@backbase/ui-ang/icon';
import { NotificationsCommunication } from '../communication/notifications-communication.service';
import { LayoutComponent } from './layout.component';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';

@NgModule({
  declarations: [NavigationMenuComponent, LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    BusinessLayoutModule.forRoot(NotificationsCommunication),
    IconModule,
    HeaderModule,
    EntitlementsModule,
  ],
  exports: [LayoutComponent],
})
export class LayoutModule {}
