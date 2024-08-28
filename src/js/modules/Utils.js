import { User } from './User.js';
import { check } from 'k6';

import * as Constants from './Constants.js';

export function create_user(userInput, userRole = [Constants.SA_ROLE,Constants.USER_ADMIN_ROLE]){
    let newUser = new User(userInput.username,
                           userInput.password,
                           userInput.tenantname,
                           Constants.GAS_URL,
                           userRole);
    return newUser;
}

export function create_user_loop(jSessionId, userArray, userRole = [Constants.SA_ROLE,Constants.USER_ADMIN_ROLE]){
    for (let i = 0; i < userArray.length; ++i) {
        let user = create_user(userArray[i], userRole);
        user.create(jSessionId);
    }
}

export function delete_user_loop(jSessionId, userArray, userRole = [Constants.SA_ROLE,Constants.USER_ADMIN_ROLE]){
    for (let i = 0; i < userArray.length; ++i) {
        let user = create_user(userArray[i], userRole);
        user.delete(jSessionId);
    }
}

export function checkLogsSize(res, field){
    let size = res.json(field);
    console.log("logs size: " + size);
    check(size, {
      "Log size should be > 0": (size) => size > 0
    });
}