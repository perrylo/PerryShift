# Testing

- Oct 11 - started implementing component tests using out-of-the-box installation of Jest with Vue Test Utils
- Oct 13 - started pulling my hair out getting vue-jest/babel transforms to work with optional-chaining...

## Unit/Component tests proprietary code only

Unit tests are not concerned with implementation of libraries we use, we assume they are themselves already tested and work as expected.  These include:
- Vue/Vuex/Vue Router/Nuxt
- Vuetify
- Firebase and Firebase-Nuxt module

E2E tests would implicitly cover these anyway.

Tests should not be brittle, we prefer shallow tests over integrated tests.


## Routing

### ```/middleware/auth-route.js```

A user can either be *non-logged-in*, or *regular (logged-in)*, or *admin (logged-in)*

Assertions:
- Any non-logged-in user can ONLY reach `login` page (index.vue), and attempts to reach any other route will always redirect to `login`
- Regular users can ONLY reach `viewSchedule` page, and attempts to reach any other route will always redirect to `viewSchedule`
  - (implicit) only Admin users can reach `users` and `editSchedules` pages
- Admin users trying to reach login page are redirected to `users` page


## Pages

### ```/pages/index.vue```

Assertions: (agnostic of authentication service)
- There is an email field
- There is a password field
- There is a login button
- Successful login should redirect user
  - Regular user to /viewSchedule
  - Admin user to /users
- Unsuccessful login should display message

### ```/pages/viewSchedule.vue```

Assertions: (agnostic of data api)
- There is a data request to fetch user shifts
- There is a calendar view: (do not test Vuetify internals)
  - Calendar can be switched between Weekly and Monthly view
  - Calendar can be switched to display current, historic, and future time spans
  - Calendar displays title of currently shown time span


### ```/pages/users.vue```

Assertions:
- View should call Firebase Function `getUsers()`
  - While data fetch is incomplete the view only shows a loading indicator
  - On successful transaction `setUsers` action should be dispatched
- There is a list of users displayed to the view
- There is an Edit Schedule button for each user
  - Clicking Edit Schedule button should dispatch `setUser` action
  - Clicking Edit Schedule button shows the edit user schedule view
- There is an Edit User button for each user
  - Clicking the Edit User button shows the edit user view
- There is a Delete user button for each user *except* for currently authenticated user
  - Clicking the Delete user button show a confirmation to delete user
  - On confirmation of user delete Firebase Function `deleteUser()` should be called
  - On successful transaction `setUsers` action should be dispatched
  - While delete user transaction is incomplete the view only shows a loading indicator
- There is a New User button
- Clicking the New User button shows the user creation view
- Succesful save of a user should display a message

### ```/pages/editSchedule.vue```

Assertions:
- There is a data request to fetch user shifts
- There is a calendar view: (do not test Vuetify internals)
  - Calendar can be switched between Weekly and Monthly view
  - Calendar can be switched to display current, historic, and future time spans
  - Calendar displays title of currently shown time span
  - Clicking and dragging on any empty slot in the calendar should create a new shift
  - Clicking and dragging on any existing shift should change its schedule
  - Clicking and dragging on the bottom edge of any shift should change its duration
  - Clicking the *Delete* button of a shift should remove it
  - Any CRUD action on any shift should auto-persist to DB


## Components

### ```/components/EditUser.vue```

Assertions:
- There is a user name field
- There is a user email field
- There is a user password field
- There is an Admin role toggle
- There is a Save button
  - Clicking the Save button should call Firebase Function `saveUser()`  - While save user transaction is incomplete the view only shows a loading indicator
  - On successful transaction this view should close and a message should be displayed to user
  - On successful transcation `updateUserInUsers` action should be dispatched
- There is a Cancel button
  - Clicking Cancel button closes this view
- When there is no user data: (creating new user)
  - Name, email, and password fields are required
  - Email field cannot be any emails of current users in system
- When there is user data: (editing existing user)
  - Name and email fields are required
  - User password should only be updated if field is filled in
  - Email field can only be changed to any new email address not already used by any existing users in system or the original email address of this user

### ```/components/CalendarTitleBar.vue```

*This could be a functional component*

Assertions:
- There is a Weekly View button
- There is a Montly View button
- Clicking either Weekly or Monthly view emits 'change' event
- There is a title prop display
- There is a Today button
  - Clicking the Today button emits a 'today' event
- There is a Previous button
  - Clicking the Previous emits a 'previous' event
- There is a Next button
  - Clicking the Next emits a 'next' event

### ```/components/formFields/EmailField.vue```

Assertions:
- There is a input field of type text
- This field is always required
- This field validates against proper email structure
- There is a prop for a custom validation function
  - This field validates against custom validation function if given

### ```/components/formFields/PasswordField.vue```

Assertions:
- There is an input field of type password
- By default, this field is always required
- There is a Boolean prop that if passed can make this field optional
- There is a hide/show toggle on this field
  - Clicking this icon will hide or show the value of this field
  - By default, the value of this field is hidden

## Global State (Vuex)

Majority of logic is in Mutations, everything else is pretty much boilerplate code.

Unit Tests for Mutations

`SET_AUTH_USER`
  - When a user is not logged in, there should be no `authUser` state
  - When a user is logged in, there should be `authUser` state

`SET_USERS` - no logic

`SET_USER` - no logic

`UPDATE_USER_IN_USERS`
  - When updating an existing user, update replace existing state
  - When adding a new user, append to existing state
  - Edge case: if admin user is editing themselves then also current `authUser` state needs to be updated

`DELETE_USER_FROM_USERS`
  - When deleting an existing user, that user should also be removed from existing state


## Firebase Functions

Unit Tests for Functions.  All functions share these common assertions:
- Is only invokable programmatically
- Is only invokable by an authenticated user (logged in)
- Is only invokable by a user with admin role


`getUsers()`
  - Responds with an array of user objects

`saveUser()`
  - When creating a new user: `displayName`, `email`, `password` must be present, all other fields optional
    - Should call `firebase.auth.createUser()`
    - Should call `auth.setCustomClaims()` to set role
    - Should create a new userShiftDoc in Firestore with `uid` of new user
  - When updating a user: `uid`, `displayName`, `email` must be present, all other fields optional
    - Should call `firebase.auth.updateUser()`
    - Should call `auth.setCustomClaims()` to set role

`deleteUser()`
  - Should call `firebase.auth.deletUser()`
  - Should delete appropriate userShiftDoc in Firestore
