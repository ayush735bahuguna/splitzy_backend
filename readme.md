# Expense Sharing Application Backend

A backend API built with Node.js, Express, and MongoDB for managing group and friend expenses, payments, notifications, and push notifications via Firebase Cloud Messaging.

## Features Summary

- User authentication and profile management with JWT and image uploads
- Robust friendship system enabling friend requests and management
- Group creation, membership management, and detailed group views
- Flexible expense tracking with multiple split types and receipt attachments
- Comprehensive payment recording and validation tied to expenses
- Real-time notifications for key events with Firebase push notification support
- Strong security through route protection and input validation
- File handling integrated with Multer and Cloudinary for media storage
- Modular, scalable architecture using Express routers and Mongoose schemas

## Technology Stack

- Node.js & Express
- MongoDB with Mongoose ODM
- Firebase Cloud Messaging for push notifications
- Google Auth Library for secure token management
- Multer for file uploads
- Cloudinary for image storage

## Getting Started

### Prerequisites

- Node.js (>= 18.x)
- MongoDB instance or cloud database
- Firebase project with service account credentials (for FCM)
- Cloudinary account for image uploads

### Installation

1. Clone the repo:

   git clone https://github.com/ayush735bahuguna/splitzy_backend.git
   cd expense-sharing-backend

2. Install dependencies:

   npm install

3. Set up environment variables (`.env`) with at least:

   MONGO_URI=your_mongo_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FCM_SERVICE_ACCOUNT_PATH=path_to_your_fcm_service_account_json
   JWT_SECRET=your_secret_key
   PORT=5000
   FRONTEND_DOMAIN="http://localhost:3000"

4. Start the server: npm run dev

---

## API Endpoints

### User Routes (`/api/users`)

| Method | Endpoint    | Protected | Description                           |
| ------ | ----------- | --------- | ------------------------------------- |
| POST   | `/register` | No        | Create a new user account.            |
| POST   | `/login`    | No        | Authenticate user and get token.      |
| PUT    | `/update`   | Yes       | Update user profile and upload image. |
| GET    | `/:userId`  | Yes       | Get user details by user ID.          |
| POST   | `/`         | Yes       | Search user by name.                  |

### Friendship Routes (`/api/friendship`)

| Method | Endpoint                      | Protected | Description                                    |
| ------ | ----------------------------- | --------- | ---------------------------------------------- |
| GET    | `/`                           | Yes       | Get current user's friend list.                |
| POST   | `/initiate`                   | Yes       | Send friend request.                           |
| POST   | `/updateStatus/:friendshipId` | Yes       | Update friend request status (accept/decline). |
| GET    | `/gotRequests`                | Yes       | Get incoming friend requests.                  |
| GET    | `/sentRequests`               | Yes       | Get sent friend requests.                      |

### Expense Routes (`/api/expenses`)

| Method | Endpoint             | Protected | Description                      |
| ------ | -------------------- | --------- | -------------------------------- |
| POST   | `/`                  | Yes       | Add a new expense.               |
| GET    | `/:expenseId`        | Yes       | Get expense by ID.               |
| GET    | `/expense/:friendId` | Yes       | Get expenses involving a friend. |
| GET    | `/expense/:groupId`  | Yes       | Get expenses for a group.        |
| DELETE | `/:expenseId`        | Yes       | Delete an expense.               |

### Group Routes (`/api/groups`)

| Method | Endpoint    | Protected | Description              |
| ------ | ----------- | --------- | ------------------------ |
| GET    | `/`         | Yes       | Get user groups.         |
| POST   | `/`         | Yes       | Create a new group.      |
| GET    | `/:groupId` | Yes       | Get group details by ID. |
| PUT    | `/:groupId` | Yes       | Add user to group.       |
| DELETE | `/:groupId` | Yes       | Delete a group.          |

### Payment Routes (`/api/payments`)

| Method | Endpoint              | Protected | Description                                  |
| ------ | --------------------- | --------- | -------------------------------------------- |
| POST   | `/`                   | Yes       | Add a payment record.                        |
| GET    | `/expense/:expenseId` | Yes       | Get payments for an expense.                 |
| GET    | `/group/:groupId`     | Yes       | Get payments for a group.                    |
| GET    | `/friend/:friendId`   | Yes       | Get payments involving a friend.             |
| POST   | `/`                   | Yes       | (Duplicate route, might fetch notifications) |

---

### Notes

- All protected routes require JWT authentication.
- Certain POST routes handle file uploads (user profile images, expense receipts).

---

## Development & Contribution

- Please open issues for bugs or feature requests.
- Fork repository, create feature branch and PR for contributions.
- Write clear commit messages and maintain code quality.

---

<!-- ## License

[MIT License](LICENSE)

--- -->

## Contact

Ayush bahuguna — ayushbahuguna1122@gmail.com
