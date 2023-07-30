import { NgModule } from '@angular/core';
import {
  PlacesJourneyConfiguration,
  PlacesJourneyConfigurationToken,
  PlacesJourneyModule,
  PLACES_JOURNEY_BASE_PATH,
} from '@backbase/places-journey-ang';
import { environment } from '../../environments/environment';
import { APP_PLACES_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [PlacesJourneyModule.forRoot()],
  providers: [
    {
      provide: PlacesJourneyConfigurationToken,
      useValue: {
        latitude: 38.721681,
        longitude: -9.139905,
        mapZoom: 12,
        deElevatedHeader: true,
        apiKey: environment.googleApiKey,
        placeTypes: {
          branch: {
            iconName: 'account',
            markerUrl: 'assets/bb-places-journey-ang/branch-marker.svg',
          },
          atm: {
            iconName: 'credit-card',
            markerUrl: 'assets/bb-places-journey-ang/atm-marker.svg',
          },
        },
      } as Partial<PlacesJourneyConfiguration>,
    },
    {
      provide: PLACES_JOURNEY_BASE_PATH,
      useExisting: APP_PLACES_BASE_PATH,
    },
  ],
})
export class PlacesJourneyBundleModule {}
