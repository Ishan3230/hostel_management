# 📋 Smart Hostel Features & Role Guide

This document outlines the specific features available to each user role in the Smart Hostel Management System.

---

## 🔐 Super Admin
The Super Admin is responsible for high-level system maintenance and oversight.

*   **User Management**: Complete control over all user accounts (Super Admin, Warden, Student, Security).
*   **System Oversight**: View all active operations across the system.
*   **Data Integrity**: Capability to fix technical issues like student ID generation or room allocation errors.
*   **Global Logging**: Monitoring entry/exit logs for the entire facility.

---

## 🛡️ Warden / Admin
The Warden handles day-to-day administrative tasks and student-related matters.

*   **Student Management**: Approve registrations and maintain student details.
*   **Room Allocation**: Assign rooms to students, manage vacancies, and track room occupation status.
*   **Mess Management**: Create and update the mess menu, and monitor student feedback on food quality.
*   **Complaint Resolution**: Manage the status of student complaints from 'Pending' to 'Resolved'.
*   **Resource Oversight**: Oversee shared facilities like Gym and Laundry services.
*   **Emergency Alerts**: Broadcast system-wide emergency notifications.

---

## 🎓 Student
Students use the portal for their everyday hostel needs and facility usage.

*   **Personal Dashboard**: View room details, roommate information, and recent activities.
*   **Entry/Exit QR**: Generate and display a unique QR code for secure logging by security guards.
*   **Visitor Passes**: Submit requests for visitor entry, including guest name, purpose, and duration.
*   **Resource Booking**: Instant booking of shared facilities (Gym, Laundry) with real-time availability.
*   **Mess & Feedback**: View today's mess menu and submit ratings/feedback for improvement.
*   **Complaint Filing**: Report infrastructure or facility issues directly through the app.
*   **Student Marketplace**: A community-driven space to buy and sell items within the hostel.

---

## 👮 Security Guard
The Security Guard ensures the safety and orderly entry/exit of residents and visitors.

*   **QR Scanner**: Access to a dedicated QR scanner to verify student identities.
*   **Entry/Exit Logging**: Scan student QR codes to automatically record timestamps for tracking.
*   **Visitor Verification**: Review and approve visitor passes requested by students.
*   **Visitor Logging**: Record entry and exit times specifically for non-residents.
*   **Incident Reporting**: Quick access to log security-related incidents if necessary.

---

## 🔄 How the System Works (Workflow)

1.  **Registration**: Students register through the frontend; the Warden verifies and approves their account.
2.  **Room Assignment**: Once approved, the Warden allocates a room based on availability.
3.  **Daily Use**:
    *   The **Student** generates a QR code from their dashboard.
    *   The **Security Guard** scans this code when the student leaves or enters the hostel.
    *   The **Log** is automatically updated in the database for tracking.
4.  **Facilities**: Students book slots for Gym/Laundry; the system ensures no double-booking occurs.
5.  **Support**: If something breaks, the Student files a Complaint; the Warden receives a notification and updates the status when fixed.

---

## 🏗️ Database Tables

The system uses the following tables to store and manage data:

| Table Name | Description | Related Entities |
| :--- | :--- | :--- |
| **`users`** | Stores credentials and roles for Super Admin, Warden, Student, and Security Guard. | All Roles |
| **`rooms`** | Contains details of hostel rooms, including block, number, and capacity. | Warden, Student |
| **`room_allocation`** | Tracks which student is assigned to which room and for what period. | Room, Student |
| **`entry_exit_logs`** | Automatically records student entry and exit times via QR scanning. | Student, Security |
| **`complaints`** | Stores student-filed issues, their category, and resolution status. | Student, Warden |
| **`visitor_passes`** | Manages visitor requests, approval status, and guest details. | Student, Security |
| **`mess_menu`** | Holds the weekly or daily food schedule for the hostel mess. | Warden, Student |
| **`mess_feedback`** | Collects student ratings and comments on meals. | Student, Warden |
| **`resources`** | Lists shared facilities such as the Gym and Laundry station. | Warden, Student |
| **`resource_bookings`** | Manages reservations and time slots for shared resources. | Resource, Student |
| **`emergency_alerts`** | Stores system-wide notifications for urgent communication. | Admin, All Users |
| **`marketplace_listings`** | Contains items posted by students for sale or exchange. | Student |
| **`student_preferences`** | Stores room-related preferences during the registration process. | Student, Warden |
