import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '../aws-cognito-config';

const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId
});

export function signIn(username, password) {
  const user = new CognitoUser({ Username: username, Pool: userPool });
  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: session => resolve(session),
      onFailure: err => reject(err)
    });
  });
}

export function getCurrentUser() {
  return userPool.getCurrentUser();
}