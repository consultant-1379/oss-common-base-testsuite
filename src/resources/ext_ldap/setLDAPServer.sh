#!/bin/bash
OP=$1
KUBECONFIG=$2
NAMESPACE=$3

numRetries=10
ldapStatus=""

if [ "$OP" = "UP" ];
then
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} apply -f "./ldap-statefulset.yaml"`
  sleep 20

  while [ "$numRetries" -gt 0 ]; 
  do
    ldapStatus=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} get pod | grep "ldap-0" | awk {'print $3'}`
    #echo "$ldapStatus"

    if [ "$ldapStatus" != "Running" ]; 
    then
      #((numRetries--))
      numRetries=$((numRetries-1))
      res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete pod "ldap-0"`
      sleep 10    
    else
      numRetries=0 
    fi
  done

  if [ "$ldapStatus" = "Running" ];
  then
    sleep 10
    externalIP=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} get svc | grep "ldap-0" | awk {'print $4'}`
    #echo "EXTERNAL IP = $externalIP"
    sleep 60

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- mkdir "ldap-data"`
    #echo "res = $res"

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} cp ./users.ldif ldap-0:/`

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} cp ./group.ldif ldap-0:/`

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldapadd -xD "cn=admin,dc=example,dc=org" -f users.ldif -w admin`
    #echo "res = $res"

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldapadd -xD "cn=admin,dc=example,dc=org" -f group.ldif -w admin`
    #echo "res = $res"

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} cp ./testuser1.ldif ldap-0:/`
    #echo "res = $res"

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldapadd -x -H ldap://localhost:389 -D "cn=admin,dc=example,dc=org" -f testuser1.ldif -w admin`
    #echo "res = $res"
    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldappasswd -s pass1 -D "cn=admin,dc=example,dc=org" -x "uid=testuser1,ou=users,dc=example,dc=org" -w admin`
    #echo "res = $res"

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} cp ./ldapgroup.ldif ldap-0:/`

    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} exec ldap-0 -- ldapadd -xD "cn=admin,dc=example,dc=org" -f ldapgroup.ldif -w admin`

    #Apply Network Policy
    res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} apply -f "./ldap-netpol.yaml"`
  else
    #exit -1 
    externalIP=-1
  fi

  echo "$externalIP"
else
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete sts "ldap"`
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete svc "ldap-0"`
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete pvc "ldap-certs-ldap-0"`
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete pvc "ldap-config-ldap-0"`
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete pvc "ldap-data-ldap-0"`
  res=`kubectl --kubeconfig ${KUBECONFIG} --namespace ${NAMESPACE} delete netpol "ldap-allow-internal-traffic"`
fi
