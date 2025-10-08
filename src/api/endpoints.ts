// src/api/endpoints.ts
export const endpoints = {
    auth: {
      login: 'users/login',
      logout: '/',
      profile: 'users/profile',
    },
    location: {
        tree: 'location_master/getLocationsTree',
        kpiFitler: 'location_master/getKPIFilterLocations',
        filteredlocation: 'location_master'
    }
  };
  