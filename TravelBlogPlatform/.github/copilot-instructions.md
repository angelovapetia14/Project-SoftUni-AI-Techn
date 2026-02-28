# Travel Blog Platform

Travel Blog Platform is a multi-page web application built with JavaScript and Supabase. Users register / login, then create posts, view posts, and create / edit / delete posts. 

## Architecture and Tech Stack

Classical client-server app:
  - Front-end: JS app, Bootstrap, HTML, CSS
  - Back-end: Supabase
  - Database: PostgreSQL
  - Authentication: Supabase Auth
  - Build tools: Vite, npm
  - API: Supabase REST API
  - Hosting: Netlify
  - Source code: GitHub

  ## Modular Design

Use modular code structure, with separate files for different components, pages and features. Use ES6 modules to organize the code.

## UI Guidelines

  - Use HTML, CSS, Bootstrap and Vanilla JS for the front-end.
  - Use Bootstrap components and utilities to create a responsive and user-friendly interface.
  - Implement modern, responsive UI design, with semantic HTML.
  - Use a consistent color scheme and typography throughout the app.
  - Use appropriate icons, effects and visual cues to enhance usability.


## Pages and Navigation

  - Split the app into multiple pages: login, registration, posts list, admin panel, etc.
  - Implement pages as reusable components (HTML, CSS and JS code).
  - Use routing to navigate between pages.
  - Use full URLs like: /, /login, /register, /posts, /posts/{id}, /admin, etc.

  ## Backend and Database

  - Use Supabase as the backend and database for the app.
  - Use PostgreSQL as the database, with tables for users, projects, posts, etc.
  - Use Supabase Storage for file uploads (e.g. image attachments).
  - When changing the DB schema, always use migrations to keep track of changes.
  - After applying a migration in Supabase, keep a copy of the migration SQL file in the code.

  ## Authentication and Authorization

  - Use Supabase Auth for user authentication and authorization.
  - Implement RLS policies to restrict access to data based on user roles and permissions.
  - Implement user roles with a separate DB table (e.g. admin, user).