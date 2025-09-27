🎯 Goal 
 Build a Flarum 1.8.10 extension  that adds a GIF picker button  to the composer (the textarea where users write posts/replies). We'll build this extension inside our flarum hosted on our xampp environment (C:\xampp\htdocs\flarum_test\extensions). 
 Folders fw27\gif-pocket have already been created. 

 Information about it: 
 When a logged-in user clicks the new button: 
 A panel opens showing two tabs : 
 Global GIFs  – URLs visible to everyone. 
 Personal GIFs  – URLs only visible to the logged-in user. 
 Clicking a GIF will insert its Markdown/BBCode/HTML snippet  directly into the composer at the cursor position (no copy/paste needed). 
 All GIFs are stored by URL only  (not uploaded to the server). 
 Personal GIFs require storing user–GIF relationships in the database; global GIFs are stored once. 
 Later you can add a preview of the GIFs  inside the composer so it feels seamless. 

 🔧 Stack 
 Flarum extension  (PHP + JS) 
 PHP backend  for settings, permissions, API endpoints (to load/save GIFs) 
 Frontend  in TypeScript using Flarum's Mithril.js framework 
 Data stored via Flarum's Eloquent models & migrations 

 📝 Implementation Plan 
 Extension Skeleton 
 Create a folder extensions/fw27/gif-pocket 
 Use flarum-cli init .  inside that folder to generate the boilerplate 
 Choose MIT license, namespace FwExt\GifPicker , package manager Yarn 
 Backend 
 Add migration(s) for: 
 global_gifs  table (id, url) 
 personal_gifs  table (id, user_id, url) 
 Create API controllers/serializers so frontend can fetch both lists 
 Add permission (optional): who can add global GIFs 
 Frontend 
 Edit js/src/forum/index.ts  to: 
 Add a new button to the composer 
 Open a modal/panel with two tabs (Global/Personal) 
 Show GIF thumbnails 
 On click, insert the URL into the composer text 
 Build 
 yarn install 
 yarn build  or yarn watch 
 php flarum extensions:enable fw27-gif-pocket 
 Test in your dev forum 
 Admin 
 Add an admin settings page (later) for managing global GIFs.