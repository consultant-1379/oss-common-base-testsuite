export const TENANT_NAME = "master";
export const NEW_USER = "app-user";
export const NEW_USER_PWD = "Newericsson123!";
export const SO_URL = "{}";
export const IAM_URL = "--IAM_URL--";
export const GAS_URL = "--GAS_URL--";
export const SO_USER = "so-user";
export const SO_USER_PWD = "Ericsson123!";
export const GAS_USER = `${__ENV.GAS_USER_USERNAME}`;
export const GAS_USER_PWD = `${__ENV.GAS_USER_PASSWORD}`;
export const BDR_URL = "https://" + "--BDR_HOST--";
export const BDR_HOST = "--BDR_HOST--";

//Max number of concurrent users to be logged in the system for Tenant Management operations
export const MAX_TENANT_CONCURRENT_USERS = 5;
//Max number of Tenants in the system
export const MAX_TENANTS = 100;
//Max number of Users under a single Tenant
export const MAX_USERS_PER_TENANT = 1000;
//Tenant Description
export const TENANT_DESCRIPTION = "New_Tenant_";
export const KEYCLOACK_TOKEN_URL = "/auth/realms/master/protocol/openid-connect/token";
export const KEYCLOACK_CONFIG_URL = "/auth/admin/realms/master/components";
export const KEYCLOACK_SYNC_URL = "/auth/admin/realms/master/user-storage";
export const KEYCLOACK_GROUPS_URL = "/auth/admin/realms/master/groups";
export const KEYCLOACK_CONNECTION_TEST_URL = "/auth/admin/realms/master/testLDAPConnection";
export const KEYCLOACK_MEMBER_USER_URL = "/auth/admin/realms/master/users";
export const KEYCLOACK_CLIENT_URL = "/auth/admin/realms/master/clients";
export const KEYCLOAK_BASE_URL = "/idm/usermgmt/v1";

export const KEYCLOACK_SESSION_IDLE_TIMEOUT = 1800;
export const KEYCLOACK_SESSION_MAX_TIMEOUT = 36000;

export const LDAP_USER = "testuser1";
export const LDAP_USER_PWD = "pass1";
export const LDAP_NAME = "ldap_test";
export const LDAP_MAPPER_NAME = "OpenLdap_test";
export const LDAP_GROUPS_NAME = "ldapgroup";
export const LDAP_SERVICE_NAME = "ldap-0";
export const LDAP_TYPE_USER_STORAGE = "org.keycloak.storage.UserStorageProvider";
export const LDAP_TYPE_MAPPER_STORAGE = "org.keycloak.storage.ldap.mappers.LDAPStorageMapper";
export const LDAP_USERS_DN = "ou=users,dc=example,dc=org";
export const LDAP_BIND_DN = "cn=admin,dc=example,dc=org";
export const LDAP_BIND_PWD = "admin";
export const LDAP_MAPPER_GROUPS_DN = "ou=group,dc=example,dc=org";
export const LDAP_USER_ROLE = "OSSPortalAdmin";
export const LDAP_GROUP_ROLE = "LogViewer";

export const CLIENT_ID= 'clientcrednew';
export const CLIENT_MAPPER = 'testmapper';

export const BDR_CLIENT = "bdr-client";
export const BDR_FILE_NAME = "minio_file";

export const NUM_BASE_ALARMS = 14

//ROLES
export const SSA_ROLE = "System_SecurityAdministrator";
export const SRO_ROLE = "System_ReadOnly";
export const SA_ROLE = "System_Administrator";
export const ST_ROLE = "System_Troubleshooter";
export const USER_ADMIN_ROLE = "UserAdmin";
export const UA_EAASA_ROLE = "UserAdministration_ExtAppRbac_Application_SecurityAdministrator";
export const LOG_API_EAARO_ROLE = "LogAPI_ExtApps_Application_ReadOnly";
export const LV_SYSTEM_APP_OPERATOR_ROLE = "LogViewer_System_Application_Operator";
export const LV_EAAO_ROLE = "LogViewer_ExtApps_Application_Operator";
export const RA_ROLE = "RouteAdmin";
export const DEFAULT_ROLE = "default-roles-master";

