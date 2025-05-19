FacebookProject

FacebookProject is a comprehensive full-stack web application that emulates core functionalities of Facebook. Developed using Angular for the frontend and integrated with modern web development practices, 
this project serves as a testament to advanced skills in building scalable and interactive social networking platforms.

🚀 Features
✅ User Authentication
Secure login and registration system with form validation and session handling.
✅ User Profiles
Dynamic profile pages showing user information, bios, and post activity.
✅ News Feed
Live feed displaying posts from friends and the community.
✅ Post Creation & Management
Users can create, edit, and delete posts with text and (optional) media content.
✅ Comments & Likes
Interactive system allowing users to comment on and like posts for engagement.
✅ Role-Based Access Control
Different access levels for regular users and administrators.
✅ Admin Panel (Ban/Unban)
Admins can ban or unban users, with automatic email & sms notifications on bans.
✅ Tagging System
Posts can include hashtags for better categorization and discovery.
✅ Post Filtering
Filter posts by:
 - Your own posts
 - Specific users
 - Post titles
 - Tags (hashtags)
✅ Voting System
Users can upvote or downvote both posts and comments.
✅ Responsive Design
Mobile-first layout compatible with various screen sizes.
✅ Full Testing Suite
Includes both backend unit testing (JUnit) and frontend E2E testing (Protractor).

🛠️ Technologies Used
🖥️ Frontend:
Angular - Framework for building client applications.
TypeScript - Typed superset of JavaScript.
HTML5 & CSS3 - Markup and styling.
Bootstrap - Responsive design framework.
🧠 Backend
Java with Spring Boot.
Layered Architecture (Controller → Service → Repository).
RESTful APIs.
🗃️ Database
MySQL.
JPA / Hibernate for ORM.
🧪 Testing
Unit Testing with JUnit (backend).
E2E Testing with Protractor/Karma (frontend).

📂 Project Structure
FacebookProject/
├── front_end_facebook/       # Angular frontend
│   ├── src/
│   ├── e2e/                  # End-to-end tests
│   └── angular.json
│
├── back_end_facebook/        # Java Spring Boot backend
│   ├── src/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   └── security/
│   └── application.properties
│
├── demo/                     # Demo assets
└── README.md


📈 Future Improvements
Messaging System: Implement real-time chat between users.
Notifications: Real-time notifications for likes, comments, and friend requests.
Media Uploads: Enhance media handling with support for videos and albums.
Privacy Settings: Allow users to manage the visibility of their posts and profile information.
