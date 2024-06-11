export enum API_RESPONSE {
  DOMAIN_CONFLICT = 'Domain is already in our system.',
  ADD_DOMAIN_ERROR = 'Error adding domain.',
  GET_DOMAIN_ERROR = 'Error getting domain.',
  ADD_DOMAIN = 'Domain added.',
  GET_NEW_DOMAIN = 'Domain added to queue for scanning, please check back later.',
  GET_NO_RESULTS = 'Domain found in DB, but no records found. Please check back later.',
}

export enum CONTROLLER {
  DOMAIN = 'domain',
}
