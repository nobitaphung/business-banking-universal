import { Component } from '@angular/core';
import { PERMISSIONS } from '../../auth/permissions';

@Component({
  selector: 'bb-navigation-menu',
  templateUrl: './navigation-menu.component.html',
})
export class NavigationMenuComponent {
  permissions = PERMISSIONS;
}
