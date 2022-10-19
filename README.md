# PerryShift

Technical Assignment for Perry

**Details**
- Create a new JavaScript application using any framework of your choice. Preferably Nuxt or Vue JS, but the choice is yours!
- A user should be able to “log in” to the application as either an “employee” (somehow who is scheduled) or as a “admin” (somehow who makes the schedule)
  - As authentication can be time consuming and typically requires a backend to support it, this can be as simple as a token stored as a Cookie or in Local Storage. However, feel free to implement the authentication in whichever way you choose.
- An “employee” should be able to log in and view the Shifts on the schedule. The view can be a list of shifts, a calendar, or some other creative way to visualize the data of your choice. But the main idea is that they should be able to look at it and tell when they work.
- An “admin” should be able to log in and view the schedule, as well as create, update, and delete Shifts.
- An “admin” should be able to create, update, and delete Users
- An “employee” should only be able to view their Shifts

**Additional Guidelines**

You are not expected to create a backend for this project. The data required above can simply be stored in memory. Should you choose to use something like Firebase or Supabase to work with real data, that would certainly give you a competitive edge, but is not required or expected.

We use TailwindCSS for our styling, but feel free to use whatever system or UI Library you choose. The styling does not need to be award-winning, but it should be appealing and it should be built to showcase the emphasis on the UX.

If any part of this assignment is blocking you from completing it, make a note about the situation and move on. We’d rather see something incomplete than nothing at all.

**Deployment/Delivery**

Source code should be pushed to the Github. You will be invited to this repo following this email, let us know if you have any issues with access.

Ideally, the code will be pushed up in multiple commits so we may see your decision making process as you progress through the assignment.

**Optional Features**

If you complete the basic set of features described above and would like to take this application to the next level, here are some things that we would be impressed to see included:

- A “Drag and Drop” interaction for creating/updating shifts on the schedule
- Unit/Component/Integration tests to verify the functionality of the application (we use Cypress and Jest, but feel free to use any testing library you prefer)
- A consideration for users in different Timezones
- A live version of the application accessible via the web. We use Heroku, but feel free to use other services such as Netlify, Vercel, etc.

**Summary**

This assignment is designed with the intention of ensuring candidates can sufficiently work through a set of requirements to build a usable web application. Communication is extremely important to us, and failure to complete this assignment entirely will not be considered a failure if your thought process and problem solving skills are documented and communicated back to us. This can be communicated via email, in code comments, git commit messages, a README, all of the above, or otherwise; this is up to you. The more we can gauge how you approach issues, the more easily we can evaluate your fit for this position.

This assignment is also purposely designed to be somewhat vague. Creativity and self-starting is important and needed within our team. There are certainly details missing, but we implore you to use your best judgement and communicate your reasoning (commenting code perhaps)  in some way!



Thanks! We look forward to see what you can do


# Completed Application (Live)

PerryShift is deployed to Firebase Hosting and can be reached at

## https://perryshift.web.app/

```bash
# Sample Admin User
email: user1@test.com
password: asdfasdf

# Sample Regular User
email: user2@test.com
password: asdfasdf
```

## Tech Stack
- Vue with Nuxt
- Vuetify
- Firebase (Authentication, Hosting, Functions, Firestore)
## Features

- Authentication with two roles: regular user and admin
  - Authentication uses Firebase Auth
  - Role management implemented via custom claims within Firebase Auth
- Admins can CRUD users as well as beget other admins
  - User management implemented via Firebase Functions using Firebase-Admin SDK
  - Firebase-Admin SDK only available on server-side, Firebase Functions provide additional security
- Admins can CRUD all user shifts (including their own)
  - List of shifts per user implemented as straight-forward JSON using Firebase Firestore
  - Drag & Drop GUI with Vuetify Calendar component
- Regular users can only view their own schedule

## On the matter of considering users in different Time Zones...

*Per Everett:*
> To clarify the ask, I'll throw another scenario at you (note: this is not an additional requirement for the assignment, just something to think about in regards to time zones):

> If you had a schedule/calendar view with multiple users on it, what timezone does it make sense for the data to be displayed in?

>If your application were used by people all working in the same physical location, then perhaps the timezone of that location. If they're working remotely, then perhaps it is relative to the user viewing the schedule. You could even go so far as to say that all users of "PerryShift" are in Vancouver, and thus the data are in Pacific Time! All we ask is that you document the assumptions you've made, and make your application follow those assumptions in a consistent way.

To address this I would make the following assertions:
- Regular users only care about when they work - seeing other user's schedules is interesting at best and confusing at worst (cluttering the view).
- Admin users only care about a workplace/support center/etc being properly staffed during business hours

With that in mind, and usability being paramount, I would address time zones in the following way:

- Introduce a concept: Location.  Location does not have to be a real physical location, simply it is where a worker is doing work during his shift.  Locations have a Time Zone property.
- Users have a new property: Time Zone
- Shifts of Users
  - are always persisted to DB in an absolute time zone, GMT
  - are always tied to a location. A worker doesn't always have to work at the same location.
- Regular Users:
  - When viewing their own schedule, the view is defaulted to show only their shifts normalized to your time zone, regardless of shift location.
  - UX - User may filter view by location, and in turn opt to see the shifts of his colleagues for that location
- Admin Users:
  - A new view for locations, with scheduling views for each
    - The scheduling view for a location is always normalized to the Time Zone of the location
  - Instead of creating shifts for individual users, an admin fills a schedule of a location with users who are available to work: User and Location Time Zones match (could be fuzzy) and User has no existing shifts booked for the time-slot in question
  - When an admin views the schedule of a worker, it is by default normalized to the time zone of the worker.  The UI allows Admin to view in other time zones


## Testing

See `/test/README.md`

## Deployment

```bash
# Generate static build with Nuxt into /dist
$ npm run generate

# Login to Firebase
$ firebase login

# Deploy site files to Firebase
$ firebase deploy --only Hosting

# OR

# Deploy functions to Firebase
$ firebase deploy --only functions

# OR

# Deploy everything
$ firebase deploy
```

## TODOs

- Add more comments!!!
- Improve error handling for all Firebase transactions
- Improve Firebase rules for admin
- Better 404 page
- Optional: Implement Cypress tests - See `/test/README.md`
- Optional: Time zone consideration - See above

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `functions`

Source directory for Firebase Functions.  This folder is ignored by nuxt build.

See https://firebase.google.com/docs/functions/get-started

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).

### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
