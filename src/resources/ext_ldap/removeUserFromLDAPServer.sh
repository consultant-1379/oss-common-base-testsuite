#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2

res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} cp ./removeuser.ldif ldap-0:/`
res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldapmodify -xD "cn=admin,dc=example,dc=org" -f removeuser.ldif -w admin`
  


