export const DEFAULT_PERMISSIONS = {
    admin: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_directory', 'manage_directory', 'view_offerings', 'manage_users', 'view_treasury', 'manage_treasury', 'view_music', 'manage_music', 'view_dashboard_admin', 'manage_communication'],
    treasurer: ['view_liturgy', 'view_calendar', 'view_offerings', 'view_treasury', 'manage_treasury', 'view_dashboard_treasurer', 'manage_communication'],
    secretary: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_directory', 'manage_directory', 'view_offerings', 'view_dashboard_secretary', 'manage_communication'],
    sacristan: ['view_liturgy', 'view_calendar', 'view_sacristy', 'manage_sacristy', 'view_dashboard_sacristan', 'manage_communication', 'view_offerings'],
    musician: ['view_liturgy', 'view_calendar', 'view_music', 'manage_music', 'view_dashboard_musician', 'manage_communication', 'view_offerings'],
    acolyte: ['view_liturgy', 'view_calendar', 'view_dashboard_acolyte', 'manage_communication', 'view_offerings'],
    reader: ['view_liturgy', 'view_calendar', 'view_offerings'],
    guest: ['view_liturgy', 'view_offerings'] // Guests now see Digital Offering
};
